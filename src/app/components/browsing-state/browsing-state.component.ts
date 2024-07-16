import { Component, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GetTagsetListService } from '../../services/get-tagset-list.service';
import { Router } from '@angular/router';
import { UndoRedoService } from '../../services/undo-redo.service';
import { SelectedDimensions } from '../../models/selected-dimensions';
import { SelectedDimensionsService } from '../../services/selected-dimensions.service';
import { GetUrlToSelectedDimensionsOrCellStateService } from '../../services/get-url-to-selected-dimensions-or-cell-state.service';
import { Filter } from '../../models/filter';
import { SelectedFiltersService } from '../../services/selected-filters.service';
import { ActualSearchFile } from '../../models/actual-search-file';
import { FindElement } from '../../services/find-element.service';
import { Tagset } from '../../models/tagset';
import { Node } from '../../models/node';
import { Hierarchy } from '../../models/hierarchy';

@Component({
  selector: 'app-browsing-state',
  templateUrl: './browsing-state.component.html',
  styleUrl: './browsing-state.component.css'
})
export class BrowsingStateComponent {
  
  /** If true, we show the dimensions pannel, otherwise no */
  display_dimensions: boolean = true;

  /** If true, we show the filters pannel, otherwise no */
  display_filters: boolean = true;     

  /** If true, we show the pop-up for the dimension pre-selection, otherwise no */
  display_popup_preselection: boolean = false;    

  /** If true, we use the small screen version of the article tag. Otherwise we use the first version, which is the large screen version */
  smallscreen: boolean = false;      
  
  selectedDimensions: SelectedDimensions = new SelectedDimensions();
  selectedFilters : Filter[] = [];

  tagsetList : Tagset[] = [];


  constructor(
      private router: Router,
      @Inject(PLATFORM_ID) private platformId: Object,
      private getTagsetListService: GetTagsetListService,
      private undoredoService : UndoRedoService,
      private getUrlToSelectedDimensionsOrCellStateService : GetUrlToSelectedDimensionsOrCellStateService,
      private selectedDimensionsService : SelectedDimensionsService,
      private selectedFiltersService : SelectedFiltersService,
      private findElementService : FindElement,
    ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.smallscreen = window.innerWidth < 1101;
    }
    
    this.getUrlToSelectedDimensionsOrCellStateService.selectedDimensionsWithUrl$.subscribe(data => {
      this.selectedDimensions = data;
    });
    
    this.selectedFiltersService.filters$.subscribe(data => {
      this.selectedFilters = data;
    });
    
    this.getTagsetListService.tagsetList$.subscribe(data => {
      this.tagsetList = data;
    });
    
  }

  /**
   * Used to invert the value of display_dimensions, in order to display the dimensions pannel or not.
   */
  display_dimensions_change(): void {
    this.display_dimensions = !this.display_dimensions;
  }

  /**
   * Used to invert the value of display_filters, in order to display the filters pannel or not.
   */
  display_filters_change(): void {
    this.display_filters = !this.display_filters;
  }
  
  /**
   * Used to invert the value of display_filters, in order to display the filters pannel or not.
   */
  display_dimensions_preselection(): void {
    this.display_popup_preselection = !this.display_popup_preselection;
  }

  /**
   * Used to invert the value of display_filters, in order to display the filters pannel or not. 
   */ 
  async reload_tagset_list(): Promise<void> {
    await this.getTagsetListService.getTagsetList();
    console.log("End of refresh");
  }

  undo(){
    this.undoredoService.undo();
  }

  redo(){
    this.undoredoService.redo();
  }

  /** 
   * Each time the size of the browser window changes, it updates the smallscreen variable 
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (isPlatformBrowser(this.platformId)) {
      this.smallscreen = window.innerWidth < 1101;
    }
  }

  /**
   * Change variables to display the grid component instead of the graph component.
   */
  go_to_cellState_Page():void{
    this.router.navigate(['/cell-state']);
  }

  /**
   * Function for loading a configuration file to obtain a precise search in one go.
   * 
   * From this file, we'll retrieve the selected dimensions, the selected filters and the Pre-Selection on dimensions.
   */
  loadSearch() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
  
    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target && target.files && target.files.length > 0) {
        const file = target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (typeof result === 'string') {
            try {
              const json = JSON.parse(result);
              console.log('Import successful:', json);

              // We reduce and uncheck the elements previously selected.
              if(this.selectedDimensions.elementX && !(this.selectedDimensions.elementX?.type==="tag")){
                this.selectedDimensions.elementX.isCheckedX=false;
                this.selectedDimensions.elementX.isExpanded=false;
              }
              if(this.selectedDimensions.elementY && !(this.selectedDimensions.elementY?.type==="tag")){
                this.selectedDimensions.elementY.isCheckedY=false;
                this.selectedDimensions.elementY.isExpanded=false;
              }

              // Dim X - We retrieve the element corresponding to the one selected in the file.
              let actualX : Tagset | Node | null = this.findElementService.findElementinTagsetList(json.selectedDimensions.xid, json.selectedDimensions.xtype);
              if(actualX){
                actualX.isCheckedX = json.selectedDimensions.elementX.isCheckedX; 
                if(actualX.type==="node"){
                  this.findElementService.expandNodeParents(actualX.id);
                }
                actualX.isExpanded = json.selectedDimensions.elementX.isExpanded;
              }
              json.selectedDimensions.elementX = actualX;

              // Dim Y - We retrieve the element corresponding to the one selected in the file.
              let actualY : Tagset | Node | null = this.findElementService.findElementinTagsetList(json.selectedDimensions.yid, json.selectedDimensions.ytype);
              if(actualY){
                actualY.isCheckedY = json.selectedDimensions.elementY.isCheckedY; 
                if(actualY.type==="node"){
                  this.findElementService.expandNodeParents(actualY.id);
                }
                actualY.isExpanded = json.selectedDimensions.elementY.isExpanded;
              }
              json.selectedDimensions.elementY = actualY;

              // Filters
              json.selectedFilters.forEach((filter:Filter) => {
                let actualFilter = this.findElementService.findFilterinTagsetList(filter.id, filter.type);
                if(actualFilter){
                  if(actualFilter.type==="tag"&&filter.element.type==="tag"){
                    actualFilter.ischecked=filter.element.ischecked;
                    this.findElementService.expandFitlerTagset(actualFilter);
                  }
                  else if (actualFilter.type==="tagset"&&filter.element.type==="tagset"){
                    actualFilter.isCheckedFilters=filter.element.isCheckedFilters;
                     actualFilter.isExpanded=filter.element.isExpanded;
                  }
                  json.selectedFilters.element = actualFilter;
                }
              });

              // PreSelection - Everything is visible
              let modified_elements : (Hierarchy|Tagset)[] = [];
              this.tagsetList.forEach(tagset=>{
                tagset.hierarchies.forEach(hierarchy =>{
                  if(hierarchy.isVisible===false){
                    hierarchy.isVisible = true;
                    modified_elements.push(hierarchy);
                  }
                })
                if(tagset.isVisibleDimensions===false){
                  tagset.isVisibleDimensions = true;
                  modified_elements.push(tagset);
                }
              });
              
              // PreSelection - We change the elements in the same way as they have been changed in the conf file
              json.preSelection.forEach((list:(Hierarchy|Tagset)[]) =>{
                list.forEach(elt =>{
                  let element = this.findElementService.findTagsetOrHerarchy(elt.id, elt.type);
                  if(element && element.type ==="tagset" && elt.type==="tagset"){
                    element.isVisibleDimensions = elt.isVisibleDimensions;
                    modified_elements.push(element);
                  }
                  else if (element && element.type ==="hierarchy" && elt.type==="hierarchy") {
                    element.isVisible = elt.isVisible;
                    modified_elements.push(element);
                  }
                })
              })

              // We update the values of the various services
              this.selectedDimensionsService.selectedDimensions.next(json.selectedDimensions);
              this.selectedFiltersService.filtersSubject.next(json.selectedFilters);
              this.undoredoService.addFileAction(json,modified_elements);      //Add the Action to the UndoRedoService
            } 
            catch (error) {
              console.error('Error parsing JSON:', error);
            }
          }
        };
        reader.readAsText(file);
      }
    };
  
    input.click();
  }  

  saveSearch(){
    let actualDimensions : SelectedDimensions = this.selectedDimensions;
    let actualFilters : Filter[] = this.selectedFilters;
    let actualPreSelection : ((Hierarchy|Tagset)[])[] = this.undoredoService.AllPreSelectionDo;
    let actualSearch : ActualSearchFile = new ActualSearchFile(actualDimensions,actualFilters,actualPreSelection);

    if (actualSearch) {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(actualSearch));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = 'actualSearch.json';
      a.click();
    }
  }


  
}
