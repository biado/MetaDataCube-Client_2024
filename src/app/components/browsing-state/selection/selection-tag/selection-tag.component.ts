import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tag } from '../../../../models/tag';

@Component({
  selector: 'app-selection-tag',
  templateUrl: './selection-tag.component.html',
  styleUrl: '../selection.component.css'
})
export class SelectionTagComponent {
  @Input() tag: Tag = new Tag("test",0,0);
  @Output() isChecked = new EventEmitter<Tag>();

/**
 * Function launched when a tagset is selected or deselected as a filter.
 * 
 * In addition to changing the value of isChecked, it will warn 
 * filter-selection.component to call its onTagFilterSelected function.
 */
  toggleCheckboxTagFiltersSelected(tag:Tag) {
    this.isChecked.emit(tag);
  }
  
}
