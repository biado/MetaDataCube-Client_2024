import { Component } from '@angular/core';
import { Tagset } from '../../../models/tagset';
import { Tag } from '../../../models/tag';
import { Node } from '../../../models/node';
import { SelectionFunctionsService } from '../../../services/selection-functions.service';
import { FindElementService } from '../../../services/find-element.service';

interface CheckedElements {
  dimensions: (Tagset|Node)[];
  filters: {filters : (Tagset|Node|Tag)[], tagset : Tagset}[];
}

@Component({
  selector: 'app-checked-elements',
  templateUrl: './checked-elements.component.html',
  styleUrl: './checked-elements.component.css'
})
export class CheckedElementsComponent {
  
  checked_elements: CheckedElements = {
    dimensions: [],
    filters: []
  };
  
  
  constructor(
    private selectionFunctionsService : SelectionFunctionsService,
    private findElementService : FindElementService,
  ) {}

  /**
   * When the component is started, we get the tagsetList, the selected Dimensions and Filters
   * 
   * Each time we get new Dimensions or new Filters, we return them and update the list of checked elements
   */
  ngOnInit() {
    this.selectionFunctionsService.checked_elements$.subscribe(data => {
      let checked_elements_bis: CheckedElements = { dimensions: [], filters: [] };
      let filtersByTagsetId: { [key: number]: (Tagset | Node | Tag)[] } = {};
  
      data.forEach(elt => {
        if ((elt.type === 'tagset' || elt.type === 'node') && (elt.isCheckedX || elt.isCheckedY)) {
          checked_elements_bis.dimensions.push(elt);
        }  
        else if (elt.type === 'node' || elt.type === 'tag') {
          if (elt.tagsetID !== undefined) {
            if (!filtersByTagsetId[elt.tagsetID]) {
              filtersByTagsetId[elt.tagsetID] = [];
            }
            filtersByTagsetId[elt.tagsetID].push(elt);
          }
        }
        else{
          if (elt.id !== undefined) {
            if (!filtersByTagsetId[elt.id]) {
              filtersByTagsetId[elt.id] = [];
            }
            filtersByTagsetId[elt.id].push(elt);
          }
        }
      });
  
      // Convertir les groupes de filtres en un tableau de filtres
      checked_elements_bis.filters = Object.keys(filtersByTagsetId).map(tagsetId => ({
        filters: filtersByTagsetId[parseInt(tagsetId)],
        tagset : this.getTagset(parseInt(tagsetId)),
      }));
      
      this.checked_elements = checked_elements_bis;
    });
  }

  getTagset(tagsetId : number):Tagset{
    const element = this.findElementService.findElementinTagsetList(tagsetId,"tagset");
    if(element?.type==="tagset"){
      return element;
    }
    return new Tagset("ERROR",-1,[],[]);
  }

  /**
   * Function that will be launched if you click to check or uncheck one of the X boxes. 
   */
  dimXSelected(elt:Node|Tagset): void {
    this.selectionFunctionsService.dimXSelected(elt);
  }

  /**
   * Function that will be launched if you click to check or uncheck one of the Y boxes. 
   */
  dimYSelected(elt:Node|Tagset): void {
    this.selectionFunctionsService.dimYSelected(elt);
  }

  /**
   * Function launched when a tag is selected or deselected.
   */
  tagFilterSelected(tag: Tag) {
    this.selectionFunctionsService.tagFilterSelected(tag);
  }
  
  /**
   * Function launched when a nodes is selected or deselected as a filter.
   */
  nodeFilterSelected(node: Node) {
    this.selectionFunctionsService.nodeFilterSelected(node);
  }

  /**
   * Function launched when a tagset is selected or deselected as a filter.
   */
  tagsetFilterSelected(tagset:Tagset): void {
    this.selectionFunctionsService.tagsetFilterSelected(tagset);
  }

  /**
   * Function that checks whether all the elements in the tag list can be transformed into numbers.
   * 
   * We retrieve a list of filters, so we first have to check that the elements are indeed tags (they must be, otherwise we wouldn't reach this stage, 
   * but we'd have to reverify because of the types).
   */
  tagsNameToNumbersIsPossible(filters: (Tag|Tagset|Node)[]): boolean {
    for (const filt of filters) {
      if(filt.type==="tag"){
        const numberValue = Number(filt.name);
        if (isNaN(numberValue)) {
          return false;
        }
      }
      else{
        return false;
      }
    }
    return true;
  }

  /**
   * Function that takes a list of tags (we take a list of filters, but they're all tags, otherwise we wouldn't get to this stage),
   *  that can be transformed into numbers and transforms them into numbers (keeping the corresponding tag on hand).
   */
  convertTagsNameToNumbers(filters: (Tag|Tagset|Node)[]): { number: number, tag: Tag }[] {
    let tags : Tag[] = [];
    
    filters.forEach(filt=>{
      if(filt.type==="tag"){
        tags.push(filt);
      }
    })

    return tags
      .map(tag => ({ number: Number(tag.name), tag }))
      .filter(({ number }) => !isNaN(number));
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
  


}
