import { Component, Input  } from '@angular/core';
import { Node } from '../../../models/node';
import { SelectedDimensionsService } from '../../../services/selected-dimensions.service';


@Component({
  selector: 'app-dimensions-selection-node',
  templateUrl: './dimensions-selection-node.component.html',
  styleUrls: ['../dimensions-selection.component.css'],
})
export class DimensionsSelectionNodeComponent {
  list:Node[]=[];
  @Input() node: Node = new Node("test",0,0,this.list);
  @Input() nodegen: number=-1;
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
   * If ticked, the variables for X are defined with the data the node that has been ticked. If we uncheck, we set the variables to null.
   */
  toggleCheckboxX(node : Node): void {
      node.isCheckedX = !node.isCheckedX ;
      this.selectedDimensionsService.ischeckedX = !this.selectedDimensionsService.ischeckedX;

      if((!node.isCheckedX)&&(!this.selectedDimensionsService.ischeckedX)){
        this.selectedDimensionsService.xid = null;
        this.selectedDimensionsService.xname = null;
        this.selectedDimensionsService.xtype = null;
      }

      if((node.isCheckedX)&&(this.selectedDimensionsService.ischeckedX)){
        this.selectedDimensionsService.xid = node.id;
        this.selectedDimensionsService.xname = node.name;
        this.selectedDimensionsService.xtype = "node";
      }
  }

  /***
   * Function that will be launched if you click to check or uncheck one of the Y boxes. 
   * If ticked, the variables for Y are defined with the data of the node that has been ticked. If we uncheck, we set the variables to null.
   */
  toggleCheckboxY(node : Node): void {
    node.isCheckedY = !node.isCheckedY ;
    this.selectedDimensionsService.ischeckedY = !this.selectedDimensionsService.ischeckedY;

    if((!node.isCheckedY)&&(!this.selectedDimensionsService.ischeckedY)){
      this.selectedDimensionsService.yid = null;
      this.selectedDimensionsService.yname = null;
      this.selectedDimensionsService.ytype = null;
    }

    if((node.isCheckedY)&&(this.selectedDimensionsService.ischeckedY)){
      this.selectedDimensionsService.yid = node.id;
      this.selectedDimensionsService.yname = node.name;
      this.selectedDimensionsService.ytype = "node";
    }
  }

  /***
   * Function which, depending on whether a box X has been ticked, makes all the 
   * others unavailable (function [disabled]="true/false" in an input). 
   * We'll make all the X boxes unavailable except the one we've ticked (so that we can untick it).
   */
  shouldDisableCheckboxX(node :Node):boolean{
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
  shouldDisableCheckboxY(node :Node):boolean{
    if(node.isCheckedY){
      return false;
    }
    if(this.selectedDimensionsService.ischeckedY){
      return true;
    }else{
      return false;
    }
  }

}
