import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Tagset } from '../models/tagset';
import { Tag } from '../models/tag';
import { Hierarchy } from '../models/hierarchy';
import { Node } from '../models/node';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})

export class GetDimensionsService {
  public tagsetList : Tagset[] = [];

  /***
   * When the service is built, we will retrieve the tagsetlist from localStorage and store it in a variable.
   */
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private http: HttpClient
  ) {
    const localStorage = document.defaultView?.localStorage;

    if (localStorage) {
      const tagsetListJSON = localStorage.getItem('tagsetList');

      if (tagsetListJSON) {
        this.tagsetList = JSON.parse(tagsetListJSON);
      }
    }
  }
  

  private baseUrl = '/api';


  /***
   * Main function of this service. 
   * It will retrieve the list of tagsets and then run the function to obtain the tagset information.
   *
   * The result constant is only used to ensure that the "await" used to wait for an
   * asynchronous function works (otherwise, since we weren't using what getTagsetInformations returns,
   * TypeScript decided that there was no point in waiting for it).
   */
  async getDimensions(): Promise<void> {
    try {
        this.tagsetList = []
        const response = await this.http.get(`${this.baseUrl}/tagset`).toPromise();

        if (Array.isArray(response)) {
            const requests = response.map(element => this.getTagsetInformations(element.id));
            const result = await Promise.all(requests);
            localStorage.clear();
            console.log("LocalStorage clear");
            await this.sleep(10000);    //Wait 10s
            localStorage.setItem("tagsetList", JSON.stringify(this.tagsetList));  //Put the tagsetList in localStorage
        } else {
            console.error('The response is not an array:', response);
        }
    } catch (error) {
        console.error('Error:', error);
    }
  }

  /***
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
                this.tagsetList.push(tagset);
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

  /***
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

  /***
   *  Function that takes the list of hierarchies from api/tagset/{id} 
   * (from getTagsetInformations) and uses it to create a list of Hierarchy.   * 
   * It then returns it to getTagsetInformations
   *
   * To create the list, it will need to call the getNodeInformation function with 
   * his rootnodeid to receive its list of nodes
   */
  async getHierarchyInformations(hierarchies: any[]): Promise<Hierarchy[]> {
    let res: Hierarchy[] = [];

    for (const hierarchy of hierarchies) {
        const firstNode = await this.getNodeInformations(hierarchy.rootNodeId, null);
        const newHierarchy = new Hierarchy(hierarchy.name, hierarchy.id, hierarchy.tagsetId, hierarchy.rootNodeId, firstNode);
        res.push(newHierarchy);
    }

    return res;
  }

  /***
   * This function takes a nodeid and retrieves all the node's informations.
   *
   * For the list of children, we'll retrieve the id of each child node, 
   * and restart the function with the new node. We therefore have a recursion 
   * that stops as soon as a node has no children.
   */
  async getNodeInformations(nodeid: number, parentID: number | null = null): Promise<Node> {
    let parents: number | null = parentID;
    let children: Node[] = [];
    let name = "";
    let id = nodeid;

    try{
      const NameResponse : any = await this.http.get(`${this.baseUrl}/node/${nodeid}`).toPromise();
      const ChildResponse : any  = await this.http.get(`${this.baseUrl}/node/${nodeid}/Children`).toPromise();
      
      name = NameResponse.tagName;

      if (ChildResponse.length > 0) {
        const childPromises = ChildResponse.map((element: any) => this.getNodeInformations(element.id, id));
        children = await Promise.all(childPromises);
      }      
    } catch (error) {
      console.error('Error fetching node information:', error);
    }

    return new Node(name, id, parents, children);
  }


  /***
   * Sleep function. Allows you to wait for a given time
   */
  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


}
