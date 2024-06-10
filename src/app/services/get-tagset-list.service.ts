import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Tagset } from '../models/tagset';
import { Tag } from '../models/tag';
import { Hierarchy } from '../models/hierarchy';
import { Node } from '../models/node';
import { IndexedDbService } from './indexed-db.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class GetTagsetListService {
  /** tagsetListSubject is an observable subject, storing a list of Tagsets.  */
  private tagsetListSubject = new BehaviorSubject<Tagset[]>([]);
  /** tagset$ is a public observable, providing access to tagsetListSubject externally.  */
  tagsetList$ = this.tagsetListSubject.asObservable();

  /**
   * When the service is built, we will retrieve the tagsetlist
   */
  constructor(
    private http: HttpClient,
    private indexedDbService: IndexedDbService,
  ) {    this.loadTagsets();  }

  private baseUrl = '/api';

  /**
   * Function that loads the tagsetList. It will use the indexedDB service to retrieve the list stored on it.
   */
  async loadTagsets() {
    await this.waitNSeconds(100);

    try {
      const res = await this.indexedDbService.retrieveTagsets();
      console.log('Tagsets loaded from IndexedDB:', res);
      this.tagsetListSubject.next(res);
      if(this.tagsetListSubject.value && this.tagsetListSubject.value.length<=0){
        console.log('Start getTagsetList from GetTagsetListService');
        const res = await this.getTagsetList();
        console.log('End of getTagsetList');
      }
    } catch (error) {
      //console.error('Error loading tagsets from IndexedDB:', error);
    }
  }

  /**
   * Sort a Tagset list alphabetically (Symbol -> Number ->aAbCdDeF)
   */
  sortTagsets(tagsets: Tagset[]): Tagset[] {
    return tagsets.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Main function of this service. 
   * It will retrieve the list of tagsets and then run the function to obtain the tagset information.
   *
   * The result constant is only used to ensure that the "await" used to wait for an
   * asynchronous function works (otherwise, since we weren't using what getTagsetInformations returns,
   * TypeScript decided that there was no point in waiting for it).
   */
  async getTagsetList(): Promise<void> {
    try {
        this.tagsetListSubject.next([]);
        const response = await this.http.get(`${this.baseUrl}/tagset`).toPromise();

        if (Array.isArray(response)) {            
            const requests = response.map(element => this.getTagsetInformations(element.id));
            const result = await Promise.all(requests);

            const sortedTagsets = this.sortTagsets(this.tagsetListSubject.value);
            this.tagsetListSubject.next(sortedTagsets);
            await this.indexedDbService.storeTagsets(sortedTagsets);    // Store TagsetList in IndexedDB

        } else {
            console.error('The response is not an array:', response);
        }
    } catch (error) {
        console.error('Error:', error);
    }
  }

  /**
   * Function that retrieves information from tagsets. 
   * It will send the list of tags and hierarchies for further processing, 
   * wait to receive the list of tags and hierarchies in return and then create a 
   * new Tagset.
   * 
   * This version of the function, which returns a promise of value 2, is only used
   * to ensure that the await getdimensions function works properly.
   */
  async getTagsetInformations(id: number): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        this.http.get(`${this.baseUrl}/tagset/${id}`).subscribe(
            async (response: any) => {
                let tags = await this.getTagsInformations(response.tags);
                let hierarchies = await this.getHierarchyInformations(response.hierarchies);
                let tagset = new Tagset(response.name, response.id, hierarchies, tags);
                
                const updatedTagsets = [...this.tagsetListSubject.value, tagset];
                this.tagsetListSubject.next(updatedTagsets);

                resolve(2);
            },
            (error) => {
                console.error('Error:', error);
                reject(error);
            }
        );
    });
  } 

  /* Unpromised version of the getTagsetInformation function */
  /*async getTagsetInformations(id: number): Promise<void> {
    this.http.get(`${this.baseUrl}/tagset/${id}`).subscribe(
        async (response: any) => {
            let tags = await this.getTagsInformations(response.tags);
            
            let hierarchies = await this.getHierarchyInformations(response.hierarchies);

            let tagset = new Tagset(response.name, response.id, hierarchies, tags);
            this.tagsetList.push(tagset);
        },
        (error) => {
            console.error('Error:', error); 
        }
    );
  } */

  /**
   *  Function that takes the list of tags from api/tagset/{id} 
   * (from getTagsetInformations) and uses it to create a list of Tag.
   * 
   * It then returns it to getTagsetInformations
   */
  async getTagsInformations(tags: any[]): Promise<Tag[]> {
    const tagPromises = tags.map(async (tag: any) => {
      return new Tag(tag.name, tag.id, tag.tagsetId);
    });
  
    try {
      return await Promise.all(tagPromises);
    } catch (error) {
      console.error('Error fetching tags information:', error);
      return []; 
    }
  }

  /**
   *  Function that takes the list of hierarchies from api/tagset/{id} 
   * (from getTagsetInformations) and uses it to create a list of Hierarchy.   * 
   * It then returns it to getTagsetInformations
   *
   * To create the list, it will need to call the getNodeInformation. 
   * To do this, we go to api/hierarchy/{id} because nodes[0] contains the entire hierarchical tree.
   * 
   * We'll send this first node to the getNodeInformations function, which will process this node and its descendants and place them in the node models.
   */
  async getHierarchyInformations(hierarchies: any[]): Promise<Hierarchy[]> {
    let res: Hierarchy[] = [];

    for (const hierarchy of hierarchies) {
        const hierarchyInformations : any = await this.http.get(`${this.baseUrl}/hierarchy/${hierarchy.id}`).toPromise()
        const firstNode = await this.getNodeInformations(hierarchyInformations.nodes[0], null);
        const newHierarchy = new Hierarchy(hierarchy.name, hierarchy.id, hierarchy.tagsetId, hierarchy.rootNodeId, firstNode);
        res.push(newHierarchy);
    }

    return res;
  } 

  /**
   * This function takes a rawnode (from api/hierarchy/{id}) and retrieves all the node's informations.
   *
   * For the list of children, for each child of the actual node, we'll send each child to the function (recursivity). 
   * We therefore have a recursion that stops as soon as a node has no children.
   */
  async getNodeInformations(rawnode: any, parentID: number | null = null): Promise<Node> {
    let parents: number | null = parentID;
    let children: Node[] = [];
    let name = "";
    let id = rawnode.id;

    try{
      name = rawnode.tag.name;

      if (rawnode.children && rawnode.children.length > 0) {
        const childPromises = rawnode.children.map((element: any) => this.getNodeInformations(element, id));
        children = await Promise.all(childPromises);
      }      
    } catch (error) {
      console.error('Error fetching node information:', error);
    }

    return new Node(name, id, parents, children);
  } 

  /**
   * Wait function. Take ms (1000 millisecondes = 1 secondes)
   */
  async waitNSeconds(N:number): Promise<void> {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, N);
    });
  }


}
