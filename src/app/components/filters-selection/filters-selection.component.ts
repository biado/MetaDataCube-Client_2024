import { Component } from '@angular/core';
import { GetDimensionsService } from '../../services/get-dimensions.service';
import { SelectedDimensionsService } from '../../services/selected-dimensions.service';
import { Tagset } from '../../models/tagset';
import { Tag } from '../../models/tag';

@Component({
  selector: 'app-filters-selection',
  templateUrl: './filters-selection.component.html',
  styleUrl: './filters-selection.component.css'
})
export class FiltersSelectionComponent {
  filterstosearch = '';
  tagsetlist: Tagset[] = [];
  selectedTagFilters: Tag[] = [];
  selectedTagsetFilters: Tagset[] = [];

  constructor(
    private getDimensionsService: GetDimensionsService,                   // Service that will obtain the list of tagset
    protected selectedDimensionsService:SelectedDimensionsService,        // Service containing information on selected dimensions
  ) 
  {}

  /**
   * When the component is started, a list of all the tagset.
   * 
   * Also we put all tagsets / hierarchies / nodes to visible (initial state)
   */
  async ngOnInit(): Promise<void> {
    this.getDimensionsService.tagset$.subscribe(data => {
      this.tagsetlist = this.sortTagsets(data);
    });

    /*this.tagsetlist.forEach(tagset => {
      tagset.isVisibleFilters = true;
      tagset.tags.forEach(tag=>{
        tag.isVisible = true;
      });
    });*/
  }

  /**
   * When a tag (filters-selection-tags.component) is selected, 
   * it will send a signal to this component, which will launch this function. 
   * 
   * Depending on whether the tag has been selected or deselected, we will add
   * it to selectedTagFilters or remove it.
   */
  onTagFilterSelected(tag: Tag) {
    if (tag.ischecked) {
      if (!this.selectedTagFilters.includes(tag)) {
        this.selectedTagFilters.push(tag);
      }
    } else {
      const index = this.selectedTagFilters.indexOf(tag);
      if (index !== -1) {
        this.selectedTagFilters.splice(index, 1);
      }
    }
  }

  /**
   * Function launched when a tagset is selected or deselected as a filter. 
   * 
   * If the tagset is selected, it is added to selectedTagsetFilters, 
   * if it is deselected, it is removed.
   */
  toggleCheckboxTagsetFilters(tagset:Tagset): void {
    tagset.isCheckedFilters = !tagset.isCheckedFilters;

    if (tagset.isCheckedFilters) {
      if (!this.selectedTagsetFilters.includes(tagset)) {
        this.selectedTagsetFilters.push(tagset);
      }
    } else {
      const index = this.selectedTagsetFilters.indexOf(tagset);
      if (index !== -1) {
        this.selectedTagsetFilters.splice(index, 1);
      }
    }
  }

  //Search the tag we want 
  search_Filters(): void {

    // Function to reset all tags/tagset to isExpanded = false and isVisible = true
    function resetSearch(tagsets: Tagset[]):void{
      tagsets.forEach(tagset => {
        tagset.isVisibleFilters = true;
        tagset.isExpanded = false;
        tagset.tags.forEach(tag=>{
          tag.isVisible = true;
        });
      });
    }

    // Reset all nodes if nodestosearch is empty
    if (this.filterstosearch === '') {
      resetSearch(this.tagsetlist);
      return;
    }

    // We go through the tagset list to retrieve items starting with nodetosearch and display them.
    this.tagsetlist.forEach(tagset => {
      tagset.isVisibleFilters = false; 
      if(tagset.name.toString().startsWith(this.filterstosearch)){
        tagset.isVisibleFilters = true;
      }
      tagset.tags.forEach(tag => {
          tag.isVisible = false; 
            if (tag.name.toString().startsWith(this.filterstosearch)) {
              tag.isVisible = true;

              // Display the tagset of the corresponding tag
              tagset.isExpanded = true;
              tagset.isVisibleFilters = true;
            }
      });
    });

  }

  /**
   * Function to delete the selection of filters made.
   */ 
  clearFiltersSelection():void{
    console.log("\n ListTagsets : ",this.selectedTagsetFilters,"\n ListTags : ",this.selectedTagFilters);
    this.selectedTagFilters.forEach(tag => {
        tag.ischecked = false;
    });

    this.selectedTagsetFilters.forEach(tagset => {
      tagset.isCheckedFilters = false;
    });

    this.selectedTagFilters=[];
    this.selectedTagsetFilters=[];
  }

  /**
  * Sort a Tagset list alphabetically (Symbol -> Number ->aAbCdDeF).
  */
  sortTagsets(tagsets: Tagset[]): Tagset[] {
    return tagsets.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
  * Sort a Tag list alphabetically (Symbol -> Number ->aAbCdDeF).
  */
  sortTags(tags: Tag[]): Tag[] {
    return tags.sort((a, b) => a.name.toString().localeCompare(b.name.toString()));
  }

   /**
   * Defines the visual to be taken by a tagset's scroll button
   * (- if the list is scrolled, + otherwise).
   */
   toggleButton(tagset:Tagset): string {
    return tagset.isExpanded ? '-' : '+';
  }

  /**
   * Applies to the tagset whether it is scrolled down or not.
   */
  toggleTagset(tagset:Tagset): void {
    tagset.isExpanded = !tagset.isExpanded;
  }

}
