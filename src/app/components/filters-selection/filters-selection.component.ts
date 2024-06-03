import { Component } from '@angular/core';
import { GetDimensionsService } from '../../services/get-dimensions.service';
import { SelectedDimensionsService } from '../../services/selected-dimensions.service';
import { Tagset } from '../../models/tagset';
import { Tag } from '../../models/tag';
import { SelectedFiltersService } from '../../services/selected-filters.service';

@Component({
  selector: 'app-filters-selection',
  templateUrl: './filters-selection.component.html',
  styleUrl: './filters-selection.component.css'
})
export class FiltersSelectionComponent {
  filterstosearch = '';
  tagsetlist: Tagset[] = [];

  constructor(
    private getDimensionsService: GetDimensionsService,                   // Service that will obtain the list of tagset
    protected selectedDimensionsService:SelectedDimensionsService,        // Service containing information on selected dimensions
    private selectedFiltersService:SelectedFiltersService                  // Service containing information on selected filters
  ) 
  {}

  /**
   * When the component is started, a list of all the tagset.
   * 
   * Also we put all tagsets / hierarchies / nodes to visible (initial state)
   */
  async ngOnInit(): Promise<void> {
    this.getDimensionsService.tagsetList$.subscribe(data => {
      this.tagsetlist = data;
    });
  }

  /**
   * When a tag (filters-selection-tags.component) is selected, 
   * it will send a signal to this component, which will launch this function. 
   * 
   * Depending on whether the tag has been selected or deselected, we will call the add function of the service or the remove function.
   */
  onTagFilterSelected(tag: Tag) {
    if (tag.ischecked) {
      this.selectedFiltersService.addFilter(tag.id,tag.type);
    } else {
      this.selectedFiltersService.removeFilter(tag.id,tag.type);
    }

    console.log(this.selectedFiltersService.getFiltersList());
  }

  /**
   * Function launched when a tagset is selected or deselected as a filter. 
   * 
   * If the tagset is selected, we call add function of the service, 
   * if it is deselected, it is the remove function.
   */
  toggleCheckboxTagsetFilters(tagset:Tagset): void {
    tagset.isCheckedFilters = !tagset.isCheckedFilters;

    if (tagset.isCheckedFilters) {
      this.selectedFiltersService.addFilter(tagset.id,tagset.type);
    } else {
      this.selectedFiltersService.removeFilter(tagset.id,tagset.type);
    }

    console.log(this.selectedFiltersService.getFiltersList());
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
    this.selectedFiltersService.clearSelection();
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
