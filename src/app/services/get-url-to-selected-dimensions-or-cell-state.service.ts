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

  selectedDimensionsWithUrl = new BehaviorSubject<SelectedDimensions>(new SelectedDimensions());     
  /** SelectedDimensions with url corresponding to the selected Dimensions and Filters
   * 
   * (we can't modify the selectedDimensionsService selectedDimensions directly,otherwise we'd get a loop, as this service calls a function each time the selectedDimensionsService selectedDimensions changes)
   */
  selectedDimensionsWithUrl$ = this.selectedDimensionsWithUrl.asObservable();


  selectedCellStatesWithUrl = new BehaviorSubject<SelectedCellState>(new SelectedCellState());     
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
      this.addUrlCorrespondToSelectedCellState(this.selectedCellState,this.filters);
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
   * 
   * If two filters of the same type have the same tagset, then in this case we'll put them in the same set in the url to create an OR. Otherwise, we'll use AND.
   * 
   * OR : filters=[{"type":"type","ids":[id1,id2]}]
   * AND : filters=[{"type":"type","ids":[id1]},{"type":"type","ids":[id2]}]
   */ 
  private createCellUrl(filters:Filter[],xid?: number, xtype?: 'node'|'tagset'|'tag', yid?: number, ytype?: 'node'|'tagset'|'tag'):string{
    let url:string = `api/cell/?`;
    
    // xAxis
    if(xid && xtype){
      url = url + `xAxis={\"type\":\"${xtype}\",\"id\":${xid}}&`;
    }
    
    // yAxis
    if( yid && ytype){
      url = url + `yAxis={\"type\":\"${ytype}\",\"id\":${yid}}&`;
    }

    // Filters
    if(filters && filters.length>0){
      url = url + `filters=[`

      let sameTagsetFilters: { [key: string]: Filter[] } = {};

      // We group the filter with the same type and tagsetID
      for (const filt of filters) {
        let key: string;
        if (filt.element.type === 'tagset') {
          key = `${filt.element.id}_${filt.element.type}`;
        } else {
          key = `${filt.element.tagsetID}_${filt.element.type}`;
        }
        if (!sameTagsetFilters[key]) {
          sameTagsetFilters[key] = [];
        }
        sameTagsetFilters[key].push(filt);
      }

      // We create the corresponding URL
      for (const key in sameTagsetFilters) {
        if (sameTagsetFilters.hasOwnProperty(key)) {
          const [tagsetID, type] = key.split('_');
          const filters = sameTagsetFilters[key];
          url = url + `{"type":"${type}","ids":[`;
          
          for (const filter of filters) {
            url = url + `${filter.id},`
          }
          url = url.substring(0, url.length-1);
          url = url + `]},`
        }
      }

      url = url.substring(0, url.length-1);
      url = url + `]&`
    }

    // End of the URL (we delete the last "&")
    url = url.substring(0, url.length-1);

    console.log("URL: ",url);
    return url;
  }


}
