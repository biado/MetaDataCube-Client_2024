import { Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { GetTagsetListService } from '../../../services/get-tagset-list.service';
import { Tagset } from '../../../models/tagset';
import { Node } from '../../../models/node';
import { Hierarchy } from '../../../models/hierarchy';
import { SelectedDimensionsService } from '../../../services/selected-dimensions.service';
import { SelectedDimensions } from '../../../models/selected-dimensions';
import { UndoRedoService } from '../../../services/undo-redo.service';

@Component({
  selector: 'app-dimensions-selection',
  templateUrl: './dimensions-selection.component.html',
  styleUrls: ['./dimensions-selection.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DimensionsSelectionComponent {
  nodestosearch = '';
  tagsetlist: Tagset[] = [];

  checked_elements : (Tagset|Node)[] = [];     //

  selectedDimensions : SelectedDimensions = new SelectedDimensions();

  constructor(
    private getTagsetListService: GetTagsetListService,                   
    protected selectedDimensionsService:SelectedDimensionsService,        
    private undoredoService : UndoRedoService,
  ) 
  {}

  /**
   * When the component is started, we get a list of all the tagset.
   * 
   * Also we get the selected dimensions with selectedDimensions
   */
  async ngOnInit(): Promise<void> {
    this.getTagsetListService.tagsetList$.subscribe(data => {
      this.tagsetlist = data;
    });

    this.selectedDimensionsService.selectedDimensions$.subscribe(data => {
      this.selectedDimensions = data;
      this.checked_elements = [];
      if(data.elementX && !(data.elementX.type==='tag')){
        this.checked_elements.push(data.elementX);
      }
      if(data.elementY && !(data.elementY.type==='tag')){
        this.checked_elements.push(data.elementY);
      }
    });
  }

  /**
   * Function that, depending on what you type in the taskbar, displays tags / hierarchies / nodes starting with what you've typed. 
   * It will then display only the corresponding elements and all its ancestors.
   * 
   * When you return to the initial state (nothing in the search bar), you will make everything visible again.
   * 
   * This function comprises two internal functions
   */
  search_Dimensions(): void {

    // Function to reset all nodes to isExpanded = false and isVisible = true
    function resetAllNodes(tagsets: Tagset[]): void {
        tagsets.forEach(tagset => {
            tagset.isVisibleDimensions = true;
            tagset.hierarchies.forEach(hierarchy => {
                hierarchy.isVisible = true;
                const nodesToProcess: Node[] = [hierarchy.firstNode];
                while (nodesToProcess.length > 0) {
                    const currentNode = nodesToProcess.pop()!;
                    currentNode.isExpandedDimensions = false;
                    currentNode.isVisibleDimensions = true;
                    if (currentNode.children) {
                        nodesToProcess.push(...currentNode.children);
                    }
                }
            });
        });
    }

    // Recursive function to mark parents as isExpanded and isVisible
    function expandParents(node: Node, allNodes: Map<number, Node>): void {
        if (node.parentID !== null) {
            const parent = allNodes.get(node.parentID);
            if (parent) {
                parent.isExpandedDimensions = true;
                parent.isVisibleDimensions = true;
                expandParents(parent, allNodes);
            }
        }
    }

    // Recursive function to mark children Visible
    function childrenVisible(node:Node, toSearch : string){
      if(node.children && node.children.length > 0){
        node.children.forEach(child =>{
          child.isVisibleDimensions = true;
          if (!(child.name.startsWith(toSearch))) {
            child.isExpandedDimensions = false;
          }
          childrenVisible(child,toSearch);
        })
      }
    }

    // Reset all nodes if nodestosearch is empty
    if (this.nodestosearch === '') {
        resetAllNodes(this.tagsetlist);
        return;
    }

    // We go through the tagset list to retrieve items starting with nodetosearch and display them.
    this.tagsetlist.forEach(tagset => {
        tagset.isVisibleDimensions = false; // Hide default tagsets
        if(tagset.name.startsWith(this.nodestosearch)){
          tagset.isVisibleDimensions = true;
        }
        tagset.hierarchies.forEach(hierarchy => {
            hierarchy.isVisible = false; // Hide default hierarchies
            const nodesToProcess: Node[] = [hierarchy.firstNode];
            const allNodes: Map<number, Node> = new Map();

            if(hierarchy.name.startsWith(this.nodestosearch)){
              hierarchy.isVisible = true;
            }

            // Map of all the nodes
            while (nodesToProcess.length > 0) {
                const currentNode = nodesToProcess.pop()!;
                allNodes.set(currentNode.id, currentNode); 
                if (currentNode.children) {
                    nodesToProcess.push(...currentNode.children); // Adding children to the process
                }
            }

            // Hide all nodes 
            allNodes.forEach(node => node.isVisibleDimensions = false);

            // Search for nodes that are parents and whose name begins with nodestosearch
            // If there is a match, we display the node and its parent nodes (and hierarchy and tagset)
            allNodes.forEach(node => {
              if(node.children && node.children.length > 0){
                  if (node.name.startsWith(this.nodestosearch)) {
                      node.isExpandedDimensions = true;
                      node.isVisibleDimensions = true;
                      childrenVisible(node, this.nodestosearch);
                      expandParents(node, allNodes);

                      // Display the hierarchy and tagset of the corresponding node
                      hierarchy.isVisible = true;
                      tagset.isVisibleDimensions = true;
                  }
              }
            });

        });
    });

  }

  /**
   * Sort a hierarchy list alphabetically (Symbol -> Number ->aAbCdDeF)
   */
  sortHierarchy(hierarchy: Hierarchy[]): Hierarchy[] {
    return hierarchy.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Two next function sort a node list alphabetically (Symbol -> Number ->aAbCdDeF)
   */
  sortNodes(nodes: Node[]): Node[] {
    return nodes.sort((a, b) => a.name.toString().localeCompare(b.name.toString()));
  }
  sortNodeChildren(node:Node):Node[]{
    if (!node || !node.children || node.children.length === 0) {
      return [];    
    }
    let sortedChildren = this.sortNodes(node.children);    
    return sortedChildren;
  }

  /**
   * Defines the visual to be taken by a node's scroll button
   * (- if the list is scrolled, + otherwise)
   */
  toggleButton(node:Node): string {
    return node.isExpandedDimensions ? '-' : '+';
  }

  /**
   * Applies to the node whether it is scrolled down or not
   */
  toggleNode(node:Node): void {
    node.isExpandedDimensions = !node.isExpandedDimensions;
  }

  /**
   * True if a node has children, false otherwise 
   */
  hasNonLeafChildren(node: Node): boolean {
    if(node.children){
      return node.children && node.children.some(child => child.children && child.children.length > 0);
    }
    return false;
  }

  /**
   * Function that will be launched if you click to check or uncheck one of the X boxes. 
   * 
   * If ticked, the variables for X are defined with the data the element that has been ticked. If we uncheck, we set the variables to null.
   * If an element was already checked, we'll uncheck it and then update the values. 
   * 
   * We'll update the list of checked items depending on whether we're checking or dechecking.
   */
  toggleCheckboxX(elt:Node|Tagset): void {
    let newSelectedDimensions: SelectedDimensions = new SelectedDimensions();

    if(this.selectedDimensionsService.selectedDimensions.value.ischeckedX && !elt.isCheckedX){ 
      if((this.selectedDimensions.xid) && (this.selectedDimensions.xtype)){
        const actualElementX = this.selectedDimensions.elementX;
        if(!(actualElementX===null) && (actualElementX?.type==="node"||actualElementX?.type==="tagset")){
          actualElementX.isCheckedX = false;
        }
      }
      elt.isCheckedX = !elt.isCheckedX ;
      newSelectedDimensions = new SelectedDimensions(elt.name,elt.id,elt.type,elt,this.selectedDimensions.yname, this.selectedDimensions.yid,this.selectedDimensions.ytype,this.selectedDimensions.elementY);
      newSelectedDimensions.ischeckedX = this.selectedDimensionsService.selectedDimensions.value.ischeckedX;
      newSelectedDimensions.ischeckedY = this.selectedDimensions.ischeckedY;
    }
    else{
      elt.isCheckedX = !elt.isCheckedX ;
      this.selectedDimensionsService.selectedDimensions.value.ischeckedX = !this.selectedDimensionsService.selectedDimensions.value.ischeckedX;

      if((!elt.isCheckedX)&&(!this.selectedDimensionsService.selectedDimensions.value.ischeckedX)){
        newSelectedDimensions = new SelectedDimensions(undefined,undefined,undefined,undefined, this.selectedDimensions.yname,this.selectedDimensions.yid,this.selectedDimensions.ytype,this.selectedDimensions.elementY);
        newSelectedDimensions.ischeckedX = this.selectedDimensionsService.selectedDimensions.value.ischeckedX;
        newSelectedDimensions.ischeckedY = this.selectedDimensions.ischeckedY;
      }

      if((elt.isCheckedX)&&(this.selectedDimensionsService.selectedDimensions.value.ischeckedX)){
        newSelectedDimensions = new SelectedDimensions(elt.name,elt.id,elt.type,elt,this.selectedDimensions.yname, this.selectedDimensions.yid,this.selectedDimensions.ytype,this.selectedDimensions.elementY);
        newSelectedDimensions.ischeckedX = this.selectedDimensionsService.selectedDimensions.value.ischeckedX;
        newSelectedDimensions.ischeckedY = this.selectedDimensions.ischeckedY;
      }
    }

    this.selectedDimensionsService.selectedDimensions.next(newSelectedDimensions);
    this.undoredoService.addDimensionsAction(newSelectedDimensions);    //Add the Action to the UndoRedoService
  }

  /**
   * Function that will be launched if you click to check or uncheck one of the Y boxes. 
   * 
   * If ticked, the variables for Y are defined with the data of the element that has been ticked. If we uncheck, we set the variables to null.
   * If an element was already checked, we'll uncheck it and then update the values.
   * 
   * We'll update the list of checked items depending on whether we're checking or dechecking.
   */
  toggleCheckboxY(elt:Node|Tagset): void {
    let newSelectedDimensions:SelectedDimensions = new SelectedDimensions();

    if(this.selectedDimensionsService.selectedDimensions.value.ischeckedY && !elt.isCheckedY){ 
      if(this.selectedDimensions.yid && this.selectedDimensions.ytype ){
        const actualElementY = this.selectedDimensions.elementY;
        if(!(actualElementY===null) && (actualElementY?.type==="node"||actualElementY?.type==="tagset")){
          actualElementY.isCheckedY = false;
        }
      }
      elt.isCheckedY = !elt.isCheckedY ;
      newSelectedDimensions = new SelectedDimensions(this.selectedDimensions.xname,this.selectedDimensions.xid,this.selectedDimensions.xtype,this.selectedDimensions.elementX,elt.name,elt.id,elt.type,elt);
      newSelectedDimensions.ischeckedX = this.selectedDimensions.ischeckedX;
      newSelectedDimensions.ischeckedY = this.selectedDimensionsService.selectedDimensions.value.ischeckedY;
    }

    else{
      elt.isCheckedY = !elt.isCheckedY ;
      this.selectedDimensionsService.selectedDimensions.value.ischeckedY = !this.selectedDimensionsService.selectedDimensions.value.ischeckedY;

      if((!elt.isCheckedY)&&(!this.selectedDimensionsService.selectedDimensions.value.ischeckedY)){
        newSelectedDimensions = new SelectedDimensions(this.selectedDimensions.xname,this.selectedDimensions.xid,this.selectedDimensions.xtype, this.selectedDimensions.elementX, undefined,undefined, undefined, undefined);
        newSelectedDimensions.ischeckedX = this.selectedDimensions.ischeckedX;
        newSelectedDimensions.ischeckedY = this.selectedDimensionsService.selectedDimensions.value.ischeckedY;
      }

      if((elt.isCheckedY)&&(this.selectedDimensionsService.selectedDimensions.value.ischeckedY)){
        newSelectedDimensions = new SelectedDimensions(this.selectedDimensions.xname,this.selectedDimensions.xid,this.selectedDimensions.xtype,this.selectedDimensions.elementX,elt.name,elt.id,elt.type,elt);
        newSelectedDimensions.ischeckedX = this.selectedDimensions.ischeckedX;
        newSelectedDimensions.ischeckedY = this.selectedDimensionsService.selectedDimensions.value.ischeckedY;
      }
    } 

    this.selectedDimensionsService.selectedDimensions.next(newSelectedDimensions);
    this.undoredoService.addDimensionsAction(newSelectedDimensions);          //Add the Action to the UndoRedoService
  }

  /**
   * Function to delete the selection made for X and Y
   * 
   * We uncheck and reduce as much as possible.
   */ 
  clearDimensionsSelection(){

    if(this.selectedDimensions.xid && this.selectedDimensions.xtype){
      const elementX = this.selectedDimensions.elementX;
      if(!(elementX===null) && (elementX?.type==="node"||elementX?.type==="tagset")){
        elementX.isCheckedX = false;
      }
    }

    if(this.selectedDimensions.yid && this.selectedDimensions.ytype){
      const elementY = this.selectedDimensions.elementY;
      if(!(elementY===null) && (elementY?.type==="node"||elementY?.type==="tagset")){
        elementY.isCheckedY = false;
      }
    }

    this.tagsetlist.forEach(tagset => {
      tagset.hierarchies.forEach(hierarchy => {
          const nodesToProcess: Node[] = [hierarchy.firstNode];
          const allNodes: Map<number, Node> = new Map();

          while (nodesToProcess.length > 0) {
              const currentNode = nodesToProcess.pop()!;
              allNodes.set(currentNode.id, currentNode); 
              if (currentNode.children) {
                  nodesToProcess.push(...currentNode.children);
              }
          }

          allNodes.forEach(node => node.isExpandedDimensions = false);
      });
    });
   
    const newSelectedDimensions = new SelectedDimensions();
    newSelectedDimensions.ischeckedX = false;
    newSelectedDimensions.ischeckedY = false;
    this.selectedDimensionsService.selectedDimensions.next(newSelectedDimensions);
    this.undoredoService.addDimensionsAction(newSelectedDimensions);          //Add the Action to the UndoRedoService

    this.checked_elements = [];
  }
  
}
