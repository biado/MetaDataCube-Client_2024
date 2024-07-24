import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tag } from '../../../../models/tag';
import { Options } from '@angular-slider/ngx-slider';
import { SelectionFunctionsService } from '../../../../services/selection-functions.service';
import { SelectedFiltersService } from '../../../../services/selected-filters.service';
import { Filter } from '../../../../models/filter';
import { FindElement } from '../../../../services/find-element.service';

@Component({
  selector: 'app-selection-tag-by-range',
  templateUrl: './selection-tag-by-range.component.html',
  styleUrl: '../selection.component.css'
})
export class SelectionTagByRangeComponent {
  @Input() tagsetID: number = -1;
  @Output() selectionChange = new EventEmitter<Tag[]>();
  @Input() test: string = "";

  

  tags: {number: number, tag: Tag }[] = [];
  value : number = 0;
  highValue : number = 100;

  filterList : Tag[] = [];

  constructor(
    private selectionFunctionsService : SelectionFunctionsService,
    private selectedFiltersService : SelectedFiltersService,
    private findElementService : FindElement,
  ) {}
  
  
  options: Options = {
    floor: 1,
    ceil: 100,
  };

  ngOnInit(){
    const tagset = this.findElementService.findElementinTagsetList(this.tagsetID,"tagset");
    if(tagset?.type==="tagset"){
      this.tags = this.convertTagsNameToNumbers(tagset.tagList.tags);
    }

    this.options.floor = this.getMin(this.tags);
    this.options.ceil = this.getMax(this.tags);

    this.selectedFiltersService.filters$.subscribe(data=>{
      this.filterList = [];

      data.forEach(filter =>{
        if(filter.element.type==="tag" && filter.element.tagsetID===this.tagsetID){
          this.filterList.push(filter.element);
        }
      })

      this.value = this.getMin(this.convertTagsNameToNumbers(this.filterList));
      this.highValue = this.getMax(this.convertTagsNameToNumbers(this.filterList));
    })
  }

  onRangeChange() {
    const selectedTags = this.getFilteredTags().map(({ tag }) => tag);
    
    const notSelectedTags = this.tags
    .filter(({ number }) => (this.value !== null && number < this.value) || (this.highValue !== null && number > this.highValue))
    .map(({ tag }) => tag);

    selectedTags.forEach(tag=>{
      if (!(tag.ischecked)) {
        tag.ischecked = true;
        this.selectionFunctionsService.addFilter(tag.id,tag.type,tag);
      } 
    })

    notSelectedTags.forEach(tag=>{
      if (tag.ischecked) {
        tag.ischecked = false;
        this.selectionFunctionsService.removeFilter(tag.id,tag.type);
      } 
    })
  }

  getFilteredTags() {
    return this.tags
      .filter(({ number }) => 
        (this.value === null || number >= this.value) &&
        (this.highValue === null || number <= this.highValue)
      );
  }

  getMin(tagsNumbers : { number: number, tag: Tag }[]){
    let min : number = 999999999999;
    

    tagsNumbers.forEach(elt=>{
      if(elt.number<min){
        min = elt.number;
      }
    });

    return min;
  }

  getMax(tagsNumbers : { number: number, tag: Tag }[]){
    let max : number = -999999999999;

    tagsNumbers.forEach(elt=>{
      if(elt.number>max){
        max = elt.number;
      }
    });

    return max;
  }

  convertTagsNameToNumbers(tags: Tag[]): { number: number, tag: Tag }[] {
    return tags
      .map(tag => ({ number: Number(tag.name), tag }))
      .filter(({ number }) => !isNaN(number));
  }
}