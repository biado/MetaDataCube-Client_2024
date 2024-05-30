import { Component, ViewEncapsulation } from '@angular/core';
import { GetDimensionsService } from '../../services/get-dimensions.service';
import { Tagset } from '../../models/tagset';
import { Node } from '../../models/node';
import { Hierarchy } from '../../models/hierarchy';
import { SelectedDimensionsService } from '../../services/selected-dimensions.service';

@Component({
  selector: 'app-dimensions-selection',
  templateUrl: './dimensions-selection.component.html',
  styleUrls: ['./dimensions-selection.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DimensionsSelectionComponent {
  nodestosearch = '';
  tagsetlist: Tagset[] = [];
  id=0;

  constructor(
    private getDimensionsService: GetDimensionsService,                   // Service that will obtain the list of tagset
    protected selectedDimensionsService:SelectedDimensionsService,        // Service containing information on selected dimensions
  ) 
  { 
  }

  /***
   * When the component is started, a list of all the tagset.
   * 
   * Also we put all tagsets / hierarchies / nodes to visible (initial state)
   */
  async ngOnInit(): Promise<void> {
    this.tagsetlist.forEach(tagset => {
      tagset.isVisible = true;
      tagset.hierarchies.forEach(hierarchy => {
        hierarchy.isVisible = true;
        const nodesToProcess: Node[] = [hierarchy.firstNode];
        while (nodesToProcess.length > 0) {
          const currentNode = nodesToProcess.pop()!;
          currentNode.isVisible = true;
          if (currentNode.children) {
            nodesToProcess.push(...currentNode.children);
          }
        }
      });
    });

    this.getDimensionsService.tagset$.subscribe(data => {
      this.tagsetlist = this.sortTagsets(data);
    });

  }



  /***
   * Function that, depending on what you type in the taskbar, displays tags / hierarchies / nodes starting with what you've typed. 
   * It will then display only the corresponding elements and all its ancestors.
   * 
   * When you return to the initial state (nothing in the search bar), you will make everything visible again.
   * 
   * This function comprises two internal functions
   */
  search_suggestion(): void {

    // Function to reset all nodes to isExpanded = false and isVisible = true
    function resetAllNodes(tagsets: Tagset[]): void {
        tagsets.forEach(tagset => {
            tagset.isVisible = true;
            tagset.hierarchies.forEach(hierarchy => {
                hierarchy.isVisible = true;
                const nodesToProcess: Node[] = [hierarchy.firstNode];
                while (nodesToProcess.length > 0) {
                    const currentNode = nodesToProcess.pop()!;
                    currentNode.isExpanded = false;
                    currentNode.isVisible = true;
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
                parent.isExpanded = true;
                parent.isVisible = true;
                expandParents(parent, allNodes);
            }
        }
    }

    // Reset all nodes if nodestosearch is empty
    if (this.nodestosearch === '') {
        resetAllNodes(this.tagsetlist);
        return;
    }

    // We go through the tagset list to retrieve items starting with nodetosearch and display them.
    this.tagsetlist.forEach(tagset => {
        tagset.isVisible = false; // Hide default tagsets
        if(tagset.name.startsWith(this.nodestosearch)){
          tagset.isVisible = true;
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
            allNodes.forEach(node => node.isVisible = false);

            // Search for nodes that are parents and whose name begins with nodestosearch
            // If there is a match, we display the node and its parent nodes (and hierarchy and tagset)
            allNodes.forEach(node => {
              if(node.children && node.children.length > 0){
                  if (node.name.startsWith(this.nodestosearch)) {
                      node.isExpanded = true;
                      node.isVisible = true;
                      expandParents(node, allNodes);

                      // Display the hierarchy and tagset of the corresponding node
                      hierarchy.isVisible = true;
                      tagset.isVisible = true;
                  }
              }
            });

        });
    });

  }



  /***
   * Sort a Tagset list alphabetically (Symbol -> Number ->aAbCdDeF)
   */
  sortTagsets(tagsets: Tagset[]): Tagset[] {
    return tagsets.sort((a, b) => a.name.localeCompare(b.name));
  }

  /***
   * Sort a hierarchy list alphabetically (Symbol -> Number ->aAbCdDeF)
   */
  sortHierarchy(hierarchy: Hierarchy[]): Hierarchy[] {
    return hierarchy.sort((a, b) => a.name.localeCompare(b.name));
  }

  /***
   * Two next function sort a node list alphabetically (Symbol -> Number ->aAbCdDeF)
   */
  sortNodes(nodes: Node[]): Node[] {
    return nodes.sort((a, b) => a.name.localeCompare(b.name));
  }
  sortNodeChildren(node:Node):Node[]{
    if (!node || !node.children || node.children.length === 0) {
      return [];    
    }
    let sortedChildren = this.sortNodes(node.children);    
    return sortedChildren;
  }

  /***
   * Defines the visual to be taken by a node's scroll button
   * (- if the list is scrolled, + otherwise)
   */
  toggleButton(node:Node): string {
    return node.isExpanded ? '-' : '+';
  }

  /***
   * Applies to the node whether it is scrolled down or not
   */
  toggleNode(node:Node): void {
    node.isExpanded = !node.isExpanded;
  }

  /***
   * True if a node has children, false otherwise 
   */
  hasNonLeafChildren(node: Node): boolean {
    if(node.children){
      return node.children && node.children.some(child => child.children && child.children.length > 0);
    }
    return false;
  }

  /***
   * Function that will be launched if you click to check or uncheck one of the X boxes. 
   * If ticked, the variables for X are defined with the data the node that has been ticked. If we uncheck, we set the variables to null.
   */
  toggleCheckboxX(elt:Node|Tagset): void {
    elt.isCheckedX = !elt.isCheckedX ;
    this.selectedDimensionsService.ischeckedX = !this.selectedDimensionsService.ischeckedX;

    if((!elt.isCheckedX)&&(!this.selectedDimensionsService.ischeckedX)){
      this.selectedDimensionsService.xid = null;
      this.selectedDimensionsService.xname = null;
      this.selectedDimensionsService.xtype = null;
    }

    if((elt.isCheckedX)&&(this.selectedDimensionsService.ischeckedX)){
      this.selectedDimensionsService.xid = elt.id;
      this.selectedDimensionsService.xname = elt.name;
      this.selectedDimensionsService.xtype = elt.type;
    }
  }

  /***
   * Function that will be launched if you click to check or uncheck one of the Y boxes. 
   * If ticked, the variables for Y are defined with the data of the node that has been ticked. If we uncheck, we set the variables to null.
   */
  toggleCheckboxY(elt:Node|Tagset): void {
    elt.isCheckedY = !elt.isCheckedY ;
    this.selectedDimensionsService.ischeckedY = !this.selectedDimensionsService.ischeckedY;

    if((!elt.isCheckedY)&&(!this.selectedDimensionsService.ischeckedY)){
      this.selectedDimensionsService.yid = null;
      this.selectedDimensionsService.yname = null;
      this.selectedDimensionsService.ytype = null;
    }

    if((elt.isCheckedY)&&(this.selectedDimensionsService.ischeckedY)){
      this.selectedDimensionsService.yid = elt.id;
      this.selectedDimensionsService.yname = elt.name;
      this.selectedDimensionsService.ytype = elt.type;
    }
  }

  /***
   * Function which, depending on whether a box X has been ticked, makes all the 
   * others unavailable (function [disabled]="true/false" in an input). 
   * We'll make all the X boxes unavailable except the one we've ticked (so that we can untick it).
   */
  shouldDisableCheckboxX(node:Node|Tagset):boolean{
    if(node.isCheckedX){
      return false;
    }

    if(this.selectedDimensionsService.ischeckedX){
      return true;
    }else{
      return false;
    }
  }

  /***
   * Function which, depending on whether a box Y has been ticked, makes all the 
   * others unavailable (function [disabled]="true/false" in an input). 
   * We'll make all the Y boxes unavailable except the one we've ticked (so that we can untick it).
   */
  shouldDisableCheckboxY(elt:Node|Tagset):boolean{
    if(elt.isCheckedY){
      return false;
    }

    if(this.selectedDimensionsService.ischeckedY){
      return true;
    }else{
      return false;
    }
  }

  // Function to delete the selection made for X and Y
  clearSelection(){
    console.log(this.selectedDimensionsService.xname, "\n",this.selectedDimensionsService.xid, "\n", this.selectedDimensionsService.xtype, "\n", this.selectedDimensionsService.yname, "\n", this.selectedDimensionsService.yid, "\n", this.selectedDimensionsService.ytype, "\n")
    
    if(!(this.selectedDimensionsService.xid === null) && !(this.selectedDimensionsService.xtype === null)){
      const elementX = this.findElementinTagsetList(this.selectedDimensionsService.xid, this.selectedDimensionsService.xtype);
      if(!(elementX===null)){
        elementX.isCheckedX = false;
      }
    }

    if(!(this.selectedDimensionsService.yid === null) && !(this.selectedDimensionsService.ytype === null)){
      const elementY = this.findElementinTagsetList(this.selectedDimensionsService.yid, this.selectedDimensionsService.ytype);
      if(!(elementY===null)){
        elementY.isCheckedY = false;
      }
    }

    this.selectedDimensionsService.xid = null;
    this.selectedDimensionsService.xname = null;
    this.selectedDimensionsService.xtype = null;
    this.selectedDimensionsService.ischeckedX = false;

    this.selectedDimensionsService.yid = null;
    this.selectedDimensionsService.yname = null;
    this.selectedDimensionsService.ytype = null;
    this.selectedDimensionsService.ischeckedY = false;
  }


  findElementinTagsetList(elementid: number, elementType: 'node' | 'tagset'): Tagset | Node | null {
    let element: Tagset | Node | null = null;
    
    for (const tagset of this.tagsetlist) {
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


    return element;

  }
  
}
