import { Injectable } from '@angular/core';
import { Filter } from '../models/filter';
import { SelectedDimensions } from '../models/selected-dimensions';
import { SelectedFiltersService } from './selected-filters.service';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SelectedCellState } from '../models/selected-cell-state';
import { SelectedCellStateService } from './selected-cell-state.service';
import { GetUrlToSelectedDimensionsOrCellStateService } from './get-url-to-selected-dimensions-or-cell-state.service';

@Injectable({
  providedIn: 'root'
})
export class GetCellStateService {
  
  filters : Filter[] = [];
  
  private allImagesURI = new BehaviorSubject<{uri:string,mediaID:number}[]>([]);
  /** Images URI of of all images corresponding to the selected dimensions and filters  */
  allImagesURI$ = this.allImagesURI.asObservable();


  constructor(
    private selectedFiltersService : SelectedFiltersService,
    private selectedCellStateService : SelectedCellStateService,
    private getUrlToSelectedDimensionsOrCellStateService : GetUrlToSelectedDimensionsOrCellStateService,
    private http: HttpClient,
  ) { 
    this.selectedFiltersService.filters$.subscribe(data => {
      this.filters = data;
    });
    
    // If selectedCellState or filters get modification, it will launch getCells
    combineLatest([
      this.getUrlToSelectedDimensionsOrCellStateService.selectedCellStatesWithUrl$,
      this.selectedFiltersService.filters$
    ]).subscribe(([selectedCellState, filters]) => {
      this.getAllImages(selectedCellState,filters);
    });
  }

  /**
   * Function to retrieve all images that match the selected dimensions and filters.
   */
  private async getAllImages(selectedCellState : SelectedCellState, filters : Filter[]) {
    if ((selectedCellState.xid && selectedCellState.xtype && !(selectedCellState.xtype==='tagset')) || (selectedCellState.yid && selectedCellState.ytype) && !(selectedCellState.ytype==='tagset')) {
      const urlAllImage: string = selectedCellState.url;
      console.log("URL :",urlAllImage)
      this.allImagesURI.next([]);
      let imagesURIs: {uri:string,mediaID:number}[] = [];

      try {
          const response: any = await this.http.get(`${urlAllImage}`).toPromise();
          response.forEach((elt: any) => {
              imagesURIs.push({uri:elt.fileURI,mediaID:elt.id});
          });
          this.allImagesURI.next(imagesURIs);
      } catch (error) {
          console.error("Error in getAllImages:", error);
      }
    }
  }
}
