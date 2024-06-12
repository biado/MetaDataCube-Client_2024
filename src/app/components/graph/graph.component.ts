import { Component, EventEmitter, Output } from '@angular/core';
import { Filter } from '../../models/filter';
import { SelectedFiltersService } from '../../services/selected-filters.service';
import { SelectedDimensionsService } from '../../services/selected-dimensions.service';
import { GetGraphService } from '../../services/get-graph.service';
import { SelectedAxis } from '../../models/selected-axis';
import { combineLatest} from 'rxjs';
import { Tagset } from '../../models/tagset';
import { Node } from '../../models/node';
import { GetTagsetListService } from '../../services/get-tagset-list.service';
import { Tag } from '../../models/tag';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css'
})

export class GraphComponent {
  filters:Filter[]=[];

  tagsetList:Tagset[] = [];

  selectedAxis : SelectedAxis = new SelectedAxis();

  AxisX: string[] = [];
  AxisY: string[] = [];
  
  /**For x name and y name (of AxixX & AxixY we get the corresponding url (--See getGraphService--)). */
  contentUrl: { [key: string]: string } = {};    
  
  /**For x name and y name (of AxixX & AxixY we get the corresponding number of images (--See getGraphService--)). */
  contentCount: { [key: string]: number } = {};    

  /**graph.component.html will go straight inside. Used to avoid looking directly into content, or calling a function directly (because <img src=...> will continuously call the function). */ 
  imageUrls: { [key: string]: string } = {}; 

  /** For each x-y duo, we check whether the image is loading or not (starts at true, changes to false as soon as the image is loaded (or there's an error)). */
  isLoading: { [key: string]: boolean } = {};

  /** For each x-y duo, If loading the image causes an error, set to true. False otherwise. */
  isError: { [key: string]: boolean } = {};

  /** Send message to app-component to display grid instead of graph.  */
  @Output() display_grid = new EventEmitter();


  constructor(
    private selectedFiltersService : SelectedFiltersService,
    private selectedDimensionsService : SelectedDimensionsService,
    private getGraphService : GetGraphService,
    private getTagsetListService : GetTagsetListService,
  ){}


  async ngOnInit(): Promise<void> {    
    this.selectedFiltersService.filters$.subscribe(data => {
      this.filters = data;
    });
    this.getTagsetListService.tagsetList$.subscribe(data => {
      this.tagsetList = data;
    });
    this.selectedDimensionsService.selectedAxis$.subscribe(data => {
      this.selectedAxis = data;
    });
    this.getGraphService.AxisX$.subscribe(async data => {
      this.AxisX = data;
    });
    this.getGraphService.AxisY$.subscribe(async data => {
      this.AxisY = data;
    });
    this.getGraphService.contentUrl$.subscribe(async data => {
      this.contentUrl = data;
    });
    this.getGraphService.contentCount$.subscribe(async data => {
      this.contentCount = data;
    });

    // If AxixX, Y or contents get update, it will launch getImagesURL. That way we're sure to have the latest version.
    combineLatest([
      this.getGraphService.AxisX$,
      this.getGraphService.AxisY$,
      this.getGraphService.contentUrl$,
    ]).subscribe(([x, y,contentUrl]) => {
      this.getImagesURL(x,y);
    });

  }


  /**
   * Each time a dimension changes or the content is updated, this function is called.
   * 
   * Initializes isLoading and isError and loads image urls into imageUrls with getContent.
   * 
   * This function ensures that the images displayed are the most recent, without allowing <img> to continually launch a function
   */
  getImagesURL(x:string[],y:string[]){
    this.imageUrls = {};
    this.isLoading = {};
    this.isError = {};
    if(x && x.length > 0 && y && y.length > 0){
      x.forEach(x => {
        y.forEach(y => {
          const key = `${x}-${y}`;
          this.imageUrls[key] = this.getContent(key);
          this.isLoading[key] = true;
          this.isError[key] = false;
        });
      });
    }
    else if(x && x.length > 0){
      x.forEach(x => {
        const key = `${x}`;
        this.imageUrls[key] = this.getContent(x);
        this.isLoading[key] = true;
        this.isError[key] = false;
      });
    }
    else if(y && y.length > 0){
      y.forEach(y => {
        const key = `${y}`;
        this.imageUrls[key] = this.getContent(y);
        this.isLoading[key] = true;
        this.isError[key] = false;
      });
    }
    
  }

  /**
   * This function returns the url corresponding to one cell in the table (duo x-y) using content and baseurl (to be modified by hand depending on where the images are stored).
   * 
   * Returns the url if there is one, if there are no results for the cells in the array, then an empty string is returned.
   */
  getContent(key:string): string {
    // Test code to check whether the display is correct in html. Take a random number between 1 and 7. We have 6 test images. 
    // We'll be able to test the display of different images and check that if we can't find the image we'll get an error display.
    /*function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    const rand = getRandomInt(1,7)
    if(this.content[`${key}`]){
      return `assets/images/test${rand}.jpg`;
    }
    return '';*/
    
    // Actual function code, which returns the url corresponding to the cell image.
    let baseurl = `assets/images/lsc_thumbs512/thumbnails512/`;
    const url = this.contentUrl[key];
    if(url){
      return baseurl+url;
    }
    return '';
  }

  /** Function launched when an image is correctly loaded. We'll then set the isLoading and isError of the corresponding array cell to false. */
  onLoad(key: string) {
    this.isLoading[key] = false;
    this.isError[key] = false;
  }

  /** Function launched when there's an error loading the image. We'll then set the isLoading to False and isError on true of the corresponding array cell to false. */
  onError(key: string) {
    this.isLoading[key] = false;
    this.isError[key] = true;
  }

  /** 
   * Function to zoom on X or Y labels 
   * 
   * If a node to be zoomed in on was not extended in the dimension list, then it is extended.
   */
  zoomOnLabels(name:string, axis:'X'|'Y'){
    let newElement : Node|Tagset|null;
    
    if(axis==='X'){
      if(this.selectedAxis.xtype==='node'){
        if(this.selectedAxis.xid && this.selectedAxis.xtype){
          const actualX = this.findElementinTagsetList(this.selectedAxis.xid, this.selectedAxis.xtype);
          if(actualX?.type==='node'){
            //console.log(actualX);
            newElement = this.getNewNode(actualX,name);
            if(newElement?.children && newElement.children.length>0){
              actualX.isCheckedX = false;
              newElement.isCheckedX = true;
              this.expandNodeParents(newElement.parentID);
              this.selectedAxis.xid = newElement.id;
              this.selectedAxis.xtype = newElement.type;
              this.selectedDimensionsService.xname = name;
              this.selectedDimensionsService.selectedAxis.next(this.selectedAxis);
            }          
          }
        }    
      }
    }
    
    else if (axis==='Y'){
      if(this.selectedAxis.ytype==='node'){
        if(this.selectedAxis.yid && this.selectedAxis.ytype){
          const actualY = this.findElementinTagsetList(this.selectedAxis.yid, this.selectedAxis.ytype);
          if(actualY?.type==='node'){
            //console.log(actualY);
            newElement = this.getNewNode(actualY,name);
            if(newElement?.children && newElement.children.length>0){
              actualY.isCheckedY = false;
              actualY.isExpanded = false;
              newElement.isCheckedY = true;
              this.expandNodeParents(newElement.parentID);
              this.selectedAxis.yid = newElement.id;
              this.selectedAxis.ytype = newElement.type;
              this.selectedDimensionsService.yname = name;
              this.selectedDimensionsService.selectedAxis.next(this.selectedAxis);
            }          
          }
        }    
      }
    }
  }

  /**
   * Function to retrieve the new Axis node (the one clicked)
   */
  getNewNode(node: Node, newNodeName: string): Node | null {
    if (node.name === newNodeName) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      for (let child of node.children) {
        let res = this.getNewNode(child, newNodeName);
          if (res) {
            return res;
          }
      }
    }
    return null;
  }

  /**
   * Function that extends all the parents of a node.
   */
  expandNodeParents(parentid: number|null): void {
    if(!(parentid===null)){
      const parent = this.findElementinTagsetList(parentid,'node');
      if(parent && parent.type==='node'){
        parent.isExpanded = true;
        this.expandNodeParents(parent.parentID);
      }
    }
  }

  /**
   * Function to retrieve the tag in a tagset
   */
  getTag(tagset:Tagset, tagName:string): Tag|null {
    for (const tag of tagset.tags) {
      if(tag.name===tagName){
        return tag;
      }
    }
    return null;
  }

  /**
   * Function for viewing all the images contained in a cell.
   * 
   * If one of the cell's labbels is a node, then, if this node has children, we zoom in on the corresponding child node. 
   * If the node is a leaf, then in this case we'll replace the coordinate with the tag corresponding to the child node.
   * 
   * If the labbels is a tagset tag. In this case, we'll replace the coordinate with the corresponding tag.
   * 
   * Finally, we send a signal to app-component to display the grid component and hide the graph component.
   */
  viewAllImage(xname?: string, yname?: string): void {
    let actualX, actualY, newElementX, newElementY;

    if ((this.selectedAxis.xtype === 'node' || !xname || this.selectedAxis.xtype === 'tagset') && 
        (this.selectedAxis.ytype === 'node' || !yname || this.selectedAxis.ytype === 'tagset') && 
        (this.selectedAxis.xid || !xname) && 
        (this.selectedAxis.yid || !yname)) {

        if (xname && this.selectedAxis.xid && (this.selectedAxis.xtype === 'node' || this.selectedAxis.xtype==='tagset')) {
            actualX = this.findElementinTagsetList(this.selectedAxis.xid, this.selectedAxis.xtype);
            if (actualX?.type === 'node') {
                newElementX = this.getNewNode(actualX, xname);
            } else if (actualX?.type === 'tagset') {
                newElementX = this.getTag(actualX, xname);
            }
        }

        if (yname && this.selectedAxis.yid && (this.selectedAxis.ytype === 'node' || this.selectedAxis.ytype==='tagset')) {
            actualY = this.findElementinTagsetList(this.selectedAxis.yid, this.selectedAxis.ytype);
            if (actualY?.type === 'node') {
                newElementY = this.getNewNode(actualY, yname);
            } else if (actualY?.type === 'tagset') {
                newElementY = this.getTag(actualY, yname);
            }
        }

        if ((xname && newElementX ) || (yname && newElementY)) {
            if (actualX) {
              actualX.isCheckedX = false;
              actualX.isExpanded = false;
            }
            if (actualY) {
              actualY.isCheckedY = false;
              actualY.isExpanded = false;
            }

            if (newElementX && newElementX.type==='node' && xname) {                
                newElementX.isCheckedX = true;
                this.expandNodeParents(newElementX.parentID);
                this.selectedAxis.xid = (newElementX.children && newElementX.children.length >0) ? newElementX.id : newElementX.tagId;
                this.selectedAxis.xtype = (newElementX.children && newElementX.children.length >0) ? 'node' : 'tag';
                this.selectedDimensionsService.xname = xname;
            }

            if (newElementY && newElementY.type==='node' && yname) {
                newElementY.isCheckedY = true;
                this.expandNodeParents(newElementY.parentID);
                this.selectedAxis.yid = (newElementY.children && newElementY.children.length >0) ? newElementY.id : newElementY.tagId;
                this.selectedAxis.ytype = (newElementY.children && newElementY.children.length >0) ? 'node' : 'tag';
                this.selectedDimensionsService.yname = yname;
            }

            if (newElementX && newElementX.type==='tag' && xname) {
                this.selectedAxis.xid = newElementX.id;
                this.selectedAxis.xtype = newElementX.type;
                this.selectedDimensionsService.xname = xname;
            }

            if (newElementY && newElementY.type==='tag'  && yname) {
              this.selectedAxis.yid = newElementY.id;
              this.selectedAxis.ytype = newElementY.type;
              this.selectedDimensionsService.yname = yname;
            }

            this.selectedDimensionsService.selectedAxis.next(this.selectedAxis);
            this.display_grid.emit();
        }
    }
  }

  /**
   * Retrieves a node or tagset using the type and id of the element. This will retrieve the exact object from the tagsetList.
   * 
   * Contains an internal function  "findNodeById" which searches for the node (if the component is a node) in depth.
   */
  findElementinTagsetList(elementid: number, elementType: 'node' | 'tagset'): Tagset | Node | null {
    let element: Tagset | Node | null = null;
    
    for (const tagset of this.tagsetList) {
        if (elementType === 'tagset') {
            if (tagset.id ===  elementid) {
                element = tagset;
                break;
            }
        } 
        else if (elementType === 'node') {
            for (const hierarchy of tagset.hierarchies) {
                if (hierarchy.firstNode.id === elementid) {
                    element = hierarchy.firstNode;
                    break;
                } else {
                    const foundNode = findNodeById(hierarchy.firstNode, elementid);
                    if (foundNode) {
                        element = foundNode;
                        break;
                    }
                }
            }
        }
    }

    return element;
    

    function findNodeById(node: Node, id: number): Node | null {
      if (node.id === id) {
          return node;
      }  
      if (node.children) {
          for (const childNode of node.children) {
              const foundNode = findNodeById(childNode, id);
              if (foundNode) {
                  return foundNode;
              }
          }
      }  
      return null;
    }
  }

}

