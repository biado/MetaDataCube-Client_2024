import { Component, EventEmitter, Input, Output  } from '@angular/core';
import { Node } from '../../../../models/node';
import { SelectedDimensionsService } from '../../../../services/selected-dimensions.service';


@Component({
  selector: 'app-dimensions-selection-node',
  templateUrl: './dimensions-selection-node.component.html',
  styleUrls: ['../dimensions-selection.component.css'],
})
export class DimensionsSelectionNodeComponent {
  list:Node[]=[];
  @Input() node: Node = new Node("test",0,null,this.list,-1);
  @Input() nodegen: number=-1;
  @Output() checkX = new EventEmitter<Node>();
  @Output() checkY = new EventEmitter<Node>();
  marginLeft: number = 0.8;
  fontSize: number=1;

  constructor(
    protected selectedDimensionsService:SelectedDimensionsService,    // Service containing information on selected dimensions
  ){  }

  /***
   * Give the font size 
   */
  getFontSize():number{
    if(this.nodegen<2){
      return 0.9;
    }else{
      return 1;  
    };
  }
  
  /***
   * Sort a node list alphabetically (Symbol -> Number ->aAbCdDeF)
   */
  sortNodes(nodes: Node[] | null = null): Node[] {
    if (nodes) {
      const sortedNodes = nodes.slice();
      return sortedNodes.sort((a, b) => a.name.toString().localeCompare(b.name.toString()));
    } else {
      return [];
    }
  }

  /***
   * Defines the visual to be taken by a node's scroll button
   * (- if the list is scrolled, + otherwise)
   */
  toggleButton(node:Node): string {
    return node.isExpandedDimensions ? '-' : '+';
  }
  
  /***
   * Applies to the node whether it is scrolled down or not
   */
  toggleNode(node:Node): void {
    node.isExpandedDimensions = !node.isExpandedDimensions;
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
   * 
   * If ticked, we lauch the toggleCheckboxX of dimension-selection.component
   */
  toggleCheckboxX(node : Node): void {
    this.checkX.emit(node);
  }

  /***
   * Function that will be launched if you click to check or uncheck one of the Y boxes. 
   * 
   * If ticked, we lauch the toggleCheckboxY of dimension-selection.component
   */
  toggleCheckboxY(node : Node): void {
    this.checkY.emit(node);
  }

}
