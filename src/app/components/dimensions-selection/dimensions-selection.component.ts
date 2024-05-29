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

  constructor(
    private getDimensionsService: GetDimensionsService,                   // Service that will obtain the list of tagset
    protected selectedDimensionsService:SelectedDimensionsService,        // Service containing information on selected dimensions
  ) { }

  /***
   * When the component is started, a list of all the tagset
   */
  ngOnInit(): void {
    this.tagsetlist = this.sortTagsets(this.getDimensionsService.tagsetList);
  }

/*  search_suggestion() {    
    console.log(this.elements.filter(element => element.startsWith(this.nodestosearch)));
  }
*/

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
      this.selectedDimensionsService.xtype = elt instanceof Node ? 'node' : 'tagset';
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
      this.selectedDimensionsService.ytype = elt instanceof Node ? 'node' : 'tagset';
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


  //Test Function
  go(){
    console.log("X:",this.selectedDimensionsService.xname,",",this.selectedDimensionsService.xid,",",this.selectedDimensionsService.xtype,".\n Y:",this.selectedDimensionsService.yname,",",this.selectedDimensionsService.yid,",",this.selectedDimensionsService.ytype,".")
  }
  
}
