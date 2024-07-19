import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Node } from '../../../../models/node';

@Component({
  selector: 'app-filters-selection-nodes',
  templateUrl: './filters-selection-nodes.component.html',
  styleUrl: '../filters-selection.component.css'
})
export class FiltersSelectionNodesComponent {
  @Input() node: Node = new Node("init",-1,undefined,undefined,-1,-1);
  @Output() idchecked = new EventEmitter<Node>();

  /**
   * Function launched when a tagset is selected or deselected as a filter.
   * 
   * In addition to changing the value of isChecked, it will warn 
   * filter-selection.component to call its onTagFilterSelected function.
   */
  toggleCheckboxNodeFiltersSelected(node:Node) {
    this.idchecked.emit(node);
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
}
