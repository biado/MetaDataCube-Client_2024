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

  /** If true, we use the small screen version of the article tag. Otherwise we use the first version, which is the large screen version */
  smallscreen: boolean = false;      
  
  selectedDimensions: SelectedDimensions = new SelectedDimensions();
  selectedFilters : Filter[] = [];


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
  async refresh_selection_list(): Promise<void> {
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

  load() {
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

              let actualX : Tagset | Node | null = this.findElementService.findElementinTagsetList(json.selectedDimensions.xid, json.selectedDimensions.xtype);
              if(actualX){
                actualX.isCheckedX = json.selectedDimensions.elementX.isCheckedX; 
                if(actualX.type==="node"){
                  this.findElementService.expandNodeParents(actualX.id);
                }
                actualX.isExpanded = json.selectedDimensions.elementX.isExpanded;
              }
              json.selectedDimensions.elementX = actualX;

              let actualY : Tagset | Node | null = this.findElementService.findElementinTagsetList(json.selectedDimensions.yid, json.selectedDimensions.ytype);
              if(actualY){
                actualY.isCheckedY = json.selectedDimensions.elementY.isCheckedY; 
                if(actualY.type==="node"){
                  this.findElementService.expandNodeParents(actualY.id);
                }
                actualY.isExpanded = json.selectedDimensions.elementY.isExpanded;
              }
              json.selectedDimensions.elementY = actualY;

              console.log("2222",this.findElementService.tagsetList)
              this.selectedDimensionsService.selectedDimensions.next(json.selectedDimensions);
              this.selectedFiltersService.filtersSubject.next(json.selectedFilters);
              this.undoredoService.addDimensionsAction(json.selectedDimensions);      //Add the Action to the UndoRedoService
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

  save(){
    let actualDimensions : SelectedDimensions = this.selectedDimensions;
    let actualFilters : Filter[] = this.selectedFilters;
    let actualSearch : ActualSearchFile = new ActualSearchFile(actualDimensions,actualFilters);

    if (actualSearch) {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(actualSearch));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = 'actualSearch.json';
      a.click();
    }
  }


  
}
