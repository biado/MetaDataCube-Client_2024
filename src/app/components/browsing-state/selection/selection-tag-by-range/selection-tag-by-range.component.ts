import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tag } from '../../../../models/tag';
import { Options } from '@angular-slider/ngx-slider';
import { SelectionFunctionsService } from '../../../../services/selection-functions.service';
import { SelectedFiltersService } from '../../../../services/selected-filters.service';
import { Filter } from '../../../../models/filter';
import { FindElement } from '../../../../services/find-element.service';
import { UndoRedoService } from '../../../../services/undo-redo.service';

@Component({
  selector: 'app-selection-tag-by-range',
  templateUrl: './selection-tag-by-range.component.html',
  styleUrl: '../selection.component.css'
})
export class SelectionTagByRangeComponent {
  @Input() tagsetID: number = -1;

  tags: {number: number, tag: Tag }[] = [];
  value : number = 0;
  highValue : number = 100;

  tagsinFilterList : Tag[] = [];
  filterList : Filter[] = [];

  constructor(
    private selectionFunctionsService : SelectionFunctionsService,
    private selectedFiltersService : SelectedFiltersService,
    private findElementService : FindElement,
    private undoredoService : UndoRedoService,
  ) {}
  
  /**  Variable for setting range limits.  */
  options: Options = {
    floor: 1,
    ceil: 100,
  };

  /**
   * When each component is launched, we retrieve the list of tags in the tagset and convert them into numbers.
   * 
   * We will then recover the smallest and largest elements to make the limits.
   * 
   * Finally, each time the list of filters changes, we'll retrieve the list of filters corresponding to the tagsetID of the range. 
   * We'll then retrieve the smallest and largest elements to obtain the position of our points.
   */
  ngOnInit(){
    const tagset = this.findElementService.findElementinTagsetList(this.tagsetID,"tagset");
    if(tagset?.type==="tagset"){
      this.tags = this.convertTagsNameToNumbers(tagset.tagList.tags);
    }

    this.options.floor = this.getMin(this.tags);
    this.options.ceil = this.getMax(this.tags);

    this.selectedFiltersService.filters$.subscribe(data=>{
      this.tagsinFilterList = [];
      this.filterList = data;

      data.forEach(filter =>{
        if(filter.element.type==="tag" && filter.element.tagsetID===this.tagsetID){
          this.tagsinFilterList.push(filter.element);
        }
      });

      this.value = this.getMin(this.convertTagsNameToNumbers(this.tagsinFilterList));
      this.highValue = this.getMax(this.convertTagsNameToNumbers(this.tagsinFilterList));
    });
  }

  /**
   * Function launched when a range has been selected and validated.
   * 
   * As a filter, we'll add tags that are in the range but not yet selected. And remove filters for tags that are no longer present in the selected range.
   */
  onRangeChange() {
    const selectedTags = this.tags
    .filter(({ number }) => (this.value === null || number >= this.value) && (this.highValue === null || number <= this.highValue))
    .map(({ tag }) => tag);
    
    const notSelectedTags = this.tags
    .filter(({ number }) => (this.value !== null && number < this.value) || (this.highValue !== null && number > this.highValue))
    .map(({ tag }) => tag);

    selectedTags.forEach(tag=>{
      if (!(tag.ischecked)) {
        tag.ischecked = true;
        this.addFilter(tag.id,tag.type,tag);
      } 
    })

    notSelectedTags.forEach(tag=>{
      if (tag.ischecked) {
        tag.ischecked = false;
        this.removeFilter(tag.id,tag.type);
      } 
    })

    this.undoredoService.addFilterAction(this.filterList);     //Add the Action to the UndoRedoService
  }

  /**
   * We delete the range
   */
  deleteRange(){
    this.tags.forEach(tag=>{
      tag.tag.ischecked = false;
      this.removeFilter(tag.tag.id,tag.tag.type);
    });
    this.undoredoService.addFilterAction(this.filterList);
  }

  /**
   * Gets the smallest element in the list as a parameter.
   */
  getMin(tagsNumbers : { number: number, tag: Tag }[]){
    let min : number = 999999999999;   
    tagsNumbers.forEach(elt=>{
      if(elt.number<min){
        min = elt.number;
      }
    });
    return min;
  }

  /**
   * Gets the largest element of the list in parameter.
   */
  getMax(tagsNumbers : { number: number, tag: Tag }[]){
    let max : number = -999999999999;
    tagsNumbers.forEach(elt=>{
      if(elt.number>max){
        max = elt.number;
      }
    });
    return max;
  }

  /**
   * Function that takes a list of tags that can be transformed into numbers and transforms them into numbers (keeping the corresponding tag on hand).
   */
  convertTagsNameToNumbers(tags: Tag[]): { number: number, tag: Tag }[] {
    return tags
      .map(tag => ({ number: Number(tag.name), tag }))
      .filter(({ number }) => !isNaN(number));
  }
  
  /**
   * Take a tag, transform it into a filter and add the filter to the filterList.
   * 
   * It's the same function as in the selection-function.service, but we don't notify at each addition the undoredoService, 
   * only when we finish to add and remove everything we need (see onRangeChange()).
   */
  addFilter(id: number, type: 'tag',element:Tag): void {
    const filter = new Filter(id, type,element);

    const newfiltersList : Filter[]=[];
    this.filterList.forEach(filter=>{
      newfiltersList.push(filter);
    });
    newfiltersList.push(filter);
    
    this.filterList = newfiltersList;

    this.selectedFiltersService.filtersSubject.next(this.filterList);
  }

  /**
   * Remove a filter from the filters List
   * 
   * It's the same function as in the selection-function.service, but we don't notify at each deletion the undoredoService, 
   * only when we finish to add and remove everything we need (see onRangeChange()).
   */
  removeFilter(id: number, type: 'tag'): void {
    let element: Filter | null = null;

    const currentFilters = this.filterList;
    currentFilters.forEach(elt => {
      if (elt.type === type && elt.id === id) {
        element = elt;
      }
    });

    if (element !== null) {
      const updatedFilters = currentFilters.filter(f => f !== element);
      this.filterList = updatedFilters;
      this.selectedFiltersService.filtersSubject.next(updatedFilters);
    }
  }


}