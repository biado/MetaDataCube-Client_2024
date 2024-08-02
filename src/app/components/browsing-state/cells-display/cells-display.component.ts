import { Component, EventEmitter, Output } from '@angular/core';
import { Filter } from '../../../models/filter';
import { SelectedFiltersService } from '../../../services/selected-filters.service';
import { SelectedDimensionsService } from '../../../services/selected-dimensions.service';
import { GetCellsService } from '../../../services/get-cells.service';
import { SelectedDimensions } from '../../../models/selected-dimensions';
import { combineLatest} from 'rxjs';
import { Tagset } from '../../../models/tagset';
import { Node } from '../../../models/node';
import { GetTagsetListService } from '../../../services/get-tagset-list.service';
import { Tag } from '../../../models/tag';
import { UndoRedoService } from '../../../services/undo-redo.service';
import { SelectedCellState } from '../../../models/selected-cell-state';
import { SelectedCellStateService } from '../../../services/selected-cell-state.service';
import { FindElement } from '../../../services/find-element.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-cells-display',
  templateUrl: './cells-display.component.html',
  styleUrl: './cells-display.component.css'
})

export class CellsDisplayComponent {
  filters:Filter[]=[];

  tagsetList:Tagset[] = [];

  selectedDimensions : SelectedDimensions = new SelectedDimensions();

  AxisX: string[] = [];
  AxisY: string[] = [];
  
  /**
   * Url for the presentation media of a cell
   * 
   * For x name and y name (of AxixX & AxixY we get the corresponding url (--See getGraphService--)). 
   */
  contentUrl: { [key: string]: string|SafeResourceUrl } = {};    
  
  /** Number of media for a cell.
   * 
   * For x name and y name (of AxixX & AxixY we get the corresponding number of media (--See getGraphService--)). 
   */
  contentCount: { [key: string]: number } = {};   
  
  /** 
   * Type of the media of a cell
   * 
   * For x name and y name (of AxixX & AxixY we get the corresponding number of media (--See getGraphService--)). 
   */
  mediaType: { [key: string]: string } = {};   

  /**graph.component.html will go straight inside. Used to avoid looking directly into content, or calling a function directly (because <img src=...> will continuously call the function). */ 
  mediaUrls: { [key: string]: string|SafeResourceUrl } = {}; 

  /** For each x-y duo, we check whether the media is loading or not (starts at true, changes to false as soon as the media is loaded (or there's an error)). */
  isLoading: { [key: string]: boolean } = {};

  /** For each x-y duo, If loading the media causes an error, set to true. False otherwise. */
  isError: { [key: string]: boolean } = {};

  /** Send message to app-component to display grid instead of graph.  */
  @Output() go_to_cellState_Page = new EventEmitter();

  constructor(
    private selectedFiltersService : SelectedFiltersService,
    private selectedDimensionsService : SelectedDimensionsService,
    private selectedCellStateService : SelectedCellStateService,
    private getCellsService : GetCellsService,
    private getTagsetListService : GetTagsetListService,
    private undoredoService : UndoRedoService,
    private findElementService : FindElement,
    private sanitizer: DomSanitizer 
  ){}


  async ngOnInit(): Promise<void> {    
    this.selectedFiltersService.filters$.subscribe(data => {
      this.filters = data;
    });
    this.getTagsetListService.tagsetList$.subscribe(data => {
      this.tagsetList = data;
    });
    this.selectedDimensionsService.selectedDimensions$.subscribe(data => {
      this.selectedDimensions = data;
    });
    this.getCellsService.AxisX$.subscribe(async data => {
      this.AxisX = data;
    });
    this.getCellsService.AxisY$.subscribe(async data => {
      this.AxisY = data;
    });
    this.getCellsService.contentUrl$.subscribe(async data => {
      this.contentUrl = data;
    });
    this.getCellsService.contentCount$.subscribe(async data => {
      this.contentCount = data;
    });

    // If AxixX, Y or contents get update, it will launch getMediasURL. That way we're sure to have the latest version.
    combineLatest([
      this.getCellsService.AxisX$,
      this.getCellsService.AxisY$,
      this.getCellsService.contentUrl$,
    ]).subscribe(([x, y,contentUrl]) => {
      this.getMediasURL(x,y);
    });
  }

  /**
   * Each time a dimension changes or the content is updated, this function is called.
   * 
   * Initializes isLoading and isError and loads medias urls into mediaUrls with getContent.
   * 
   * This function ensures that the medias displayed are the most recent, without allowing <img> to continually launch a function
   */
  getMediasURL(x:string[],y:string[]){
    this.mediaUrls = {};
    this.isLoading = {};
    this.isError = {};
    if(x && x.length > 0 && y && y.length > 0){
      x.forEach(x => {
        y.forEach(y => {
          const key = `${x}-${y}`;
          this.mediaType[key] = this.getMediasType(this.contentUrl[key]);
          this.isLoading[key] = true;
          this.isError[key] = false;
  
          if(['spotify','youtube'].includes(this.mediaType[key].toLowerCase())){
            this.mediaUrls[key] = this.cleanUrl(this.contentUrl[key]);
          }
          else{
            this.mediaUrls[key] = `assets/images/lsc_thumbs512/thumbnails512/`+this.contentUrl[key];
          }
        });
      });
    }
    else if(x && x.length > 0){
      x.forEach(x => {
        const key = `${x}`;
        this.mediaType[key] = this.getMediasType(this.contentUrl[key]);
        this.isLoading[key] = true;
        this.isError[key] = false;

        if(['spotify','youtube'].includes(this.mediaType[key].toLowerCase())){
          this.mediaUrls[key] = this.cleanUrl(this.contentUrl[key]);
        }
        else{
          this.mediaUrls[key] = `assets/images/lsc_thumbs512/thumbnails512/`+this.contentUrl[key];
        }
      });
    }
    else if(y && y.length > 0){
      y.forEach(y => {
        const key = `${y}`;
        this.mediaType[key] = this.getMediasType(this.contentUrl[key]);
        this.isLoading[key] = true;
        this.isError[key] = false;

        if(['spotify','youtube'].includes(this.mediaType[key].toLowerCase())){
          this.mediaUrls[key] = this.cleanUrl(this.contentUrl[key]);
        }
        else{
          this.mediaUrls[key] = `assets/images/lsc_thumbs512/thumbnails512/`+this.contentUrl[key];
        }
      });
    }    
  }

  /**
   * Get the type of the extension of the media
   */
  getMediasType(url : string|SafeResourceUrl) : string{
    let extension : string = 'unknown';

    if(typeof url === 'string'){
      const match = url.match(/\.(\w+)(?:\?|#|$)/);
  
      if (match && ['jpg', 'png', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico','mp3','wav'].includes(match[1].toLowerCase())) {
        extension =  match[1]; 
      } else if (url.includes('spotify.com')) {
        extension =  'spotify';  
      } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
        extension =  'youtube';  
      } else {
        extension =  'unknown';  
      }
    }

    return extension;
  }

  /**
   * Sanitized the url : allow the url to be use in an iframe
   */
  cleanUrl(url : string|SafeResourceUrl){
    let sanitizedUrl :string|SafeResourceUrl = url;
    if(typeof url === 'string'){
      sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    return sanitizedUrl;
  }

  /** Function launched when a media is correctly loaded. We'll then set the isLoading and isError of the corresponding array cell to false. */
  onLoad(key: string) {
    this.isLoading[key] = false;
    this.isError[key] = false;
  }

  /** Function launched when there's an error loading the media. We'll then set the isLoading to False and isError on true of the corresponding array cell to false. */
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
      if(this.selectedDimensions.xtype==='node'){
        if(this.selectedDimensions.xid && this.selectedDimensions.xtype){
          const actualX = this.selectedDimensions.elementX;
          if(actualX?.type==='node'){
            newElement = this.getNewNode(actualX,name);
            if(newElement?.children && newElement.children.length>0){
              actualX.isCheckedX = false;
              newElement.isCheckedX = true;
              this.findElementService.expandNodeParents(newElement.parentID);
              const newSelectedDimensions : SelectedDimensions = new SelectedDimensions(name,newElement.id,newElement.type,newElement,this.selectedDimensions.yname,this.selectedDimensions.yid,this.selectedDimensions.ytype,this.selectedDimensions.elementY);
              newSelectedDimensions.ischeckedX = newElement.isCheckedX;
              newSelectedDimensions.ischeckedY = this.selectedDimensions.ischeckedY;
              this.undoredoService.addDimensionsAction(newSelectedDimensions);      //Add the Action to the UndoRedoService
              this.selectedDimensionsService.selectedDimensions.next(newSelectedDimensions);  
            }          
          }
        }    
      }
    }
    
    else if (axis==='Y'){
      if(this.selectedDimensions.ytype==='node'){
        if(this.selectedDimensions.yid && this.selectedDimensions.ytype){
          const actualY = this.selectedDimensions.elementY;
          if(actualY?.type==='node'){
            newElement = this.getNewNode(actualY,name);
            if(newElement?.children && newElement.children.length>0){
              actualY.isCheckedY = false;
              newElement.isCheckedY = true;
              this.findElementService.expandNodeParents(newElement.parentID);
              const newSelectedDimensions : SelectedDimensions = new SelectedDimensions(this.selectedDimensions.xname,this.selectedDimensions.xid,this.selectedDimensions.xtype,this.selectedDimensions.elementX,name,newElement.id,newElement.type,newElement);
              newSelectedDimensions.ischeckedX = this.selectedDimensions.ischeckedX;
              newSelectedDimensions.ischeckedY = newElement.isCheckedY;
              this.undoredoService.addDimensionsAction(newSelectedDimensions);      //Add the Action to the UndoRedoService
              this.selectedDimensionsService.selectedDimensions.next(newSelectedDimensions);
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
   * Function to retrieve the tag in a tagset
   */
  getTag(tagset:Tagset, tagName:string): Tag|null {
    for (const tag of tagset.tagList.tags) {
      if(tag.name===tagName){
        return tag;
      }
    }
    return null;
  }

  /**
   * Function for viewing all the medias contained in a cell.
   * 
   * If one of the cell's labbels is a node, then, if this node has children, we zoom in on the corresponding child node. 
   * If the node is a leaf, then in this case we'll replace the coordinate with the tag corresponding to the child node.
   * 
   * If the labbels is a tagset tag. In this case, we'll replace the coordinate with the corresponding tag.
   * 
   * Finally, we send a signal to app-component to display the grid component and hide the graph component.
   */
  viewAllMedia(xname?: string, yname?: string): void {
    let actualX, actualY, newElementX, newElementY;
    let selectedCellState = new SelectedCellState();

    if ((this.selectedDimensions.xtype === 'node' || !xname || this.selectedDimensions.xtype === 'tagset') && 
        (this.selectedDimensions.ytype === 'node' || !yname || this.selectedDimensions.ytype === 'tagset') && 
        (this.selectedDimensions.xid || !xname) && 
        (this.selectedDimensions.yid || !yname)) {

        if (xname && this.selectedDimensions.xid && (this.selectedDimensions.xtype === 'node' || this.selectedDimensions.xtype==='tagset')) {
            actualX = this.selectedDimensions.elementX;
            if (actualX?.type === 'node') {
                newElementX = this.getNewNode(actualX, xname);
            } else if (actualX?.type === 'tagset') {
                newElementX = this.getTag(actualX, xname);
            }
        }

        if (yname && this.selectedDimensions.yid && (this.selectedDimensions.ytype === 'node' || this.selectedDimensions.ytype==='tagset')) {
            actualY = this.selectedDimensions.elementY;
            if (actualY?.type === 'node') {
                newElementY = this.getNewNode(actualY, yname);
            } else if (actualY?.type === 'tagset') {
                newElementY = this.getTag(actualY, yname);
            }
        }

        if ((xname && newElementX ) || (yname && newElementY)) {
            if (newElementX && newElementX.type==='node' && xname) {  
              this.findElementService.expandNodeParents(newElementX.parentID);
              selectedCellState.xid = (newElementX.children && newElementX.children.length >0) ? newElementX.id : newElementX.tagId;
              selectedCellState.xtype = (newElementX.children && newElementX.children.length >0) ? 'node' : 'tag';
            }

            if (newElementY && newElementY.type==='node' && yname) {
              this.findElementService.expandNodeParents(newElementY.parentID);
              selectedCellState.yid = (newElementY.children && newElementY.children.length >0) ? newElementY.id : newElementY.tagId;
              selectedCellState.ytype = (newElementY.children && newElementY.children.length >0) ? 'node' : 'tag';
            }

            if (newElementX && newElementX.type==='tag' && xname) {
              selectedCellState.xid = newElementX.id;
              selectedCellState.xtype = newElementX.type;
            }

            if (newElementY && newElementY.type==='tag'  && yname) {
              selectedCellState.yid = newElementY.id;
              selectedCellState.ytype = newElementY.type;
            }
            
            this.selectedCellStateService.selectedCellState.next(new SelectedCellState());
            this.selectedCellStateService.selectedCellState.next(selectedCellState);
            this.go_to_cellState_Page.emit();
        }
    }
  }
}

