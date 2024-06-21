import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tag } from '../../../../models/tag';

@Component({
  selector: 'app-filters-selection-tag',
  templateUrl: './filters-selection-tag.component.html',
  styleUrl: '../filters-selection.component.css'
})
export class FiltersSelectionTagComponent {
  @Input() tag: Tag = new Tag("test",0,0);
  @Output() idchecked = new EventEmitter<Tag>();

/**
 * Function launched when a tagset is selected or deselected as a filter.
 * 
 * In addition to changing the value of isChecked, it will warn 
 * filter-selection.component to call its onTagFilterSelected function.
 */
  toggleCheckboxTagFiltersSelected(tag:Tag) {
    tag.ischecked = !tag.ischecked;
    this.idchecked.emit(tag);
  }
  
}
