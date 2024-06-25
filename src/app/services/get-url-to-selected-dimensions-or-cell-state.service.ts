import { Injectable } from '@angular/core';
import { Filter } from '../models/filter';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { SelectedDimensions } from '../models/selected-dimensions';
import { SelectedFiltersService } from './selected-filters.service';
import { SelectedDimensionsService } from './selected-dimensions.service';
import { SelectedCellState } from '../models/selected-cell-state';
import { SelectedCellStateService } from './selected-cell-state.service';

@Injectable({
  providedIn: 'root'
})
export class GetUrlToSelectedDimensionsOrCellStateService {
  filters : Filter[] = [];
  
  selectedDimensions : SelectedDimensions = new SelectedDimensions();
  selectedCellState : SelectedCellState = new SelectedCellState();

  private selectedDimensionsWithUrl = new BehaviorSubject<SelectedDimensions>(new SelectedDimensions());     
  /** SelectedDimensions with url corresponding to the selected Dimensions and Filters
   * 
   * (we can't modify the selectedDimensionsService selectedDimensions directly,otherwise we'd get a loop, as this service calls a function each time the selectedDimensionsService selectedDimensions changes)
   */
  selectedDimensionsWithUrl$ = this.selectedDimensionsWithUrl.asObservable();


  private selectedCellStatesWithUrl = new BehaviorSubject<SelectedCellState>(new SelectedCellState());     
  /** SelectedCellState with url corresponding to the cell from whih we want to see all the photos
   * 
   * (we can't modify the selectedCellStateService selectedCellState directly,otherwise we'd get a loop, as this service calls a function each time the selectedCellStateService selectedCellState changes)
   */
  selectedCellStatesWithUrl$ = this.selectedCellStatesWithUrl.asObservable();

  

  constructor(
    private selectedFiltersService : SelectedFiltersService,
    private selectedDimensionsService : SelectedDimensionsService,
    private selectedCellStateService : SelectedCellStateService,
  ) {    
    this.selectedFiltersService.filters$.subscribe(data => {
      this.filters = data;
    });

    this.selectedDimensionsService.selectedDimensions$.subscribe(data => {
      this.selectedDimensions = data;
    });

    this.selectedCellStateService.selectedCellState$.subscribe(data => {
      this.selectedCellState = data;
    });
    
    // If selectedDimensions or filters get modification, it will launch getCells
    combineLatest([
      this.selectedDimensionsService.selectedDimensions$,
      this.selectedFiltersService.filters$
    ]).subscribe(async ([selectedDimensions, filters]) => {
      this.addUrlCorrespondToSelectedDimensions(selectedDimensions,filters);
    });

    // If selectedCellState or filters get modification, it will launch getCells
    combineLatest([
      this.selectedCellStateService.selectedCellState$,
      this.selectedFiltersService.filters$
    ]).subscribe(async ([selectedCellState, filters]) => {
      this.addUrlCorrespondToSelectedCellState(selectedCellState,filters);
    });
   }

  /**
   * Function to be run each time the selectedDimensions of selectedDimensionsService changes or the list of filters changes.
   * 
   * Based on information from selectedDimensions and the filter list, will create the api api/cell query corresponding to the axes and filters chosen.
   * 
   * Then add the url to the selectedDimensions and modify its own selectedDimensions (we can't modify the selectedDimensionsService selectedDimensions directly, 
   * otherwise we'd get a loop, as this service calls a function each time the selectedDimensionsService selectedDimensions changes). 
   */ 
  private addUrlCorrespondToSelectedDimensions(selectedDimensions : SelectedDimensions,filters:Filter[]){
    selectedDimensions.url = this.createCellUrl(filters,selectedDimensions.xid, selectedDimensions.xtype, selectedDimensions.yid, selectedDimensions.ytype);       

    this.selectedDimensionsWithUrl.next(selectedDimensions);
  }

  /**
   * Function to be run each time the selectedCellState of selectedCellStateService changes or the list of filters changes.
   * 
   * Based on information from selectedCellState and the filter list, will create the api api/cell query corresponding to the axes and filters chosen. 
   * 
   * We add & all=[] at the end to get all the images and not the cell
   * 
   * Then add the url to the selectedCellState and modify its own selectedCellState (we can't modify the selectedCellStateService selectedCellState directly, 
   * otherwise we'd get a loop, as this service calls a function each time the selectedCellStateService selectedCellState changes). 
   */ 
  private addUrlCorrespondToSelectedCellState(selectedCellState : SelectedCellState,filters:Filter[]){
    selectedCellState.url = this.createCellUrl(filters,selectedCellState.xid, selectedCellState.xtype, selectedCellState.yid, selectedCellState.ytype) +'&all=[]';       

    this.selectedCellStatesWithUrl.next(selectedCellState);
  }

  /**
   * Function to create api/cell url corresponding to selected dimensions and filters.
   */ 
  private createCellUrl(filters:Filter[],xid?: number, xtype?: 'node'|'tagset'|'tag', yid?: number, ytype?: 'node'|'tagset'|'tag'):string{
    let url:string = `api/cell/?`;
    
    if(xid && xtype){
      url = url + `xAxis={\"type\":\"${xtype}\",\"id\":${xid}}&`;
    }
    
    if( yid && ytype){
      url = url + `yAxis={\"type\":\"${ytype}\",\"id\":${yid}}&`;
    }

    if(filters && filters.length>0){
      url = url + `filters=[`
      for(const filt of filters){
        url = url + `{"type":"${filt.type}","ids":[${filt.id}]},`
      }
      url = url.substring(0, url.length-1);
      url = url + `]&`
    }

    url = url.substring(0, url.length-1);

    console.log("URL: ",url);
    return url;
  }


}
