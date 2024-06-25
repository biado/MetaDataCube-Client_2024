import { Component } from '@angular/core';
import { GetTagsetListService } from '../../../services/get-tagset-list.service';
import { SelectedDimensionsService } from '../../../services/selected-dimensions.service';
import { Tagset } from '../../../models/tagset';
import { Tag } from '../../../models/tag';
import { SelectedFiltersService } from '../../../services/selected-filters.service';
import { Filter } from '../../../models/filter';
import { UndoRedoService } from '../../../services/undo-redo.service';

@Component({
  selector: 'app-filters-selection',
  templateUrl: './filters-selection.component.html',
  styleUrl: './filters-selection.component.css'
})
export class FiltersSelectionComponent {
  filterstosearch = '';
  tagsetlist: Tagset[] = [];

  filtersList : Filter[]=[];

  constructor(
    private getTagsetListService: GetTagsetListService,                   // Service that will obtain the list of tagset
    protected selectedDimensionsService:SelectedDimensionsService,        // Service containing information on selected dimensions
    private selectedFiltersService:SelectedFiltersService,                 // Service containing information on selected filters
    private undoredoService : UndoRedoService,
  ) 
  {}

  /**
   * When the component is started, we get a list of all the tagset.
   */
  async ngOnInit(): Promise<void> {
    this.getTagsetListService.tagsetList$.subscribe(data => {
      this.tagsetlist = data;
    });

    this.selectedFiltersService.filters$.subscribe(data =>{
      this.filtersList = data;
    })
  }

  /**
   * When a tag (filters-selection-tags.component) is selected, 
   * it will send a signal to this component, which will launch this function. 
   * 
   * Depending on whether the tag has been selected or deselected, we will call the add function of the service or the remove function.
   */
  onTagFilterSelected(tag: Tag) {
    if (tag.ischecked) {
      this.addFilter(tag.id,tag.type,tag);
    } else {
      this.removeFilter(tag.id,tag.type);
    }
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
      this.addFilter(tagset.id,tagset.type,tagset);
    } else {
      this.removeFilter(tagset.id,tagset.type);
    }

    console.log(this.filtersList);
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
    this.clearSelection();
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

  /**
   * Add a filter to the filters List
   */
  addFilter(id: number, type: 'tagset' | 'tag',element:Tag|Tagset): void {
    const filter = new Filter(id, type,element);

    const newfiltersList : Filter[]=[];
    this.filtersList.forEach(filter=>{
      newfiltersList.push(filter);
    });
    newfiltersList.push(filter);
    
    this.filtersList = newfiltersList;

    this.undoredoService.addFilterAction(this.filtersList);     //Add the Action to the UndoRedoService
    this.selectedFiltersService.filtersSubject.next(this.filtersList);
  }

  /**
   * Remove a filter from the filters List
   */
  removeFilter(id: number, type: 'tagset' | 'tag'): void {
    let element: Filter | null = null;

    const currentFilters = this.filtersList;
    currentFilters.forEach(elt => {
      if (elt.type === type && elt.id === id) {
        element = elt;
      }
    });

    if (element !== null) {
      const updatedFilters = currentFilters.filter(f => f !== element);
      this.filtersList = updatedFilters;
      this.undoredoService.addFilterAction(updatedFilters);     //Add the Action to the UndoRedoService
      this.selectedFiltersService.filtersSubject.next(updatedFilters);
    }
  }

  /**
   * Clear the filters List
   */
  clearSelection(): void {
    console.log("\n ListFilters : ", this.filtersList);
    this.filtersList.forEach(elt => {
      if(elt.element.type==="tag"){
        elt.element.ischecked = false;
      }
      else{
        elt.element.isCheckedFilters = false;
      }
    });
    this.filtersList = [];
    this.undoredoService.addFilterAction([]);     //Add the Action to the UndoRedoService
    this.selectedFiltersService.filtersSubject.next([]);
  }
}
