import { Component, EventEmitter, Input, Output  } from '@angular/core';
import { Node } from '../../../../models/node';
import { SelectedDimensionsService } from '../../../../services/selected-dimensions.service';


@Component({
  selector: 'app-selection-node',
  templateUrl: './selection-node.component.html',
  styleUrls: ['../selection.component.css'],
})
export class SelectionNodeComponent {
  list:Node[]=[];
  @Input() node: Node = new Node("test",0,null,this.list,-1,-1);
  @Input() nodegen: number=-1;
  @Output() checkX = new EventEmitter<Node>();
  @Output() checkY = new EventEmitter<Node>();
  @Output() checkfilter = new EventEmitter<Node>();

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
  
  /**
   * Function launched when a tagset is selected or deselected as a filter.
   * 
   * In addition to changing the value of isChecked, it will warn 
   * filter-selection.component to call its onTagFilterSelected function.
   */
  toggleCheckboxNodeFiltersSelected(node:Node) {
    this.checkfilter.emit(node);
  }

}
