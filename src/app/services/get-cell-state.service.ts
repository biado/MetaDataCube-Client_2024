import { Injectable } from '@angular/core';
import { Filter } from '../models/filter';
import { SelectedDimensions } from '../models/selected-dimensions';
import { SelectedFiltersService } from './selected-filters.service';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SelectedCellState } from '../models/selected-cell-state';
import { SelectedCellStateService } from './selected-cell-state.service';
import { GetUrlToSelectedDimensionsOrCellStateService } from './get-url-to-selected-dimensions-or-cell-state.service';
import { MediaInfos } from '../models/media-infos';

@Injectable({
  providedIn: 'root'
})
export class GetCellStateService {
  
  filters : Filter[] = [];
  
  private allMediasInfos = new BehaviorSubject<MediaInfos[]>([]);
  /** Images URI of of all images corresponding to the selected dimensions and filters  */
  allMediasInfos$ = this.allMediasInfos.asObservable();


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
      this.getAllMedias(selectedCellState,filters);
    });
  }

  /**
   * Function to retrieve all medias that match the selected dimensions and filters.
   */
  private async getAllMedias(selectedCellState : SelectedCellState, filters : Filter[]) {
    if ((selectedCellState.xid && selectedCellState.xtype && !(selectedCellState.xtype==='tagset')) || (selectedCellState.yid && selectedCellState.ytype) && !(selectedCellState.ytype==='tagset')) {
      const urlAllMedia: string = selectedCellState.url;
      console.log("URL :",urlAllMedia)
      this.allMediasInfos.next([]);
      let mediasInfo: MediaInfos[] = [];

      try {
          const response: any = await this.http.get(`${urlAllMedia}`).toPromise();
          console.log("TEST : ", response)
          response.forEach((elt: any) => {

            let extension : string;
            const match = elt.fileURI.match(/\.(\w+)(?:\?|#|$)/);

            if (match) {
              extension =  match[1]; 
            } else if (elt.fileURI.includes('spotify.com')) {
              extension =  'spotify';  
            } else if (elt.fileURI.includes('youtube.com')) {
              extension =  'youtube';  
            } else {
              extension =  'unknown';  
            }

            const mediaInfo = new MediaInfos(elt.fileURI, elt.id, extension);

            /* 
              These two lines are used to add the name and artist of a piece of music. 
              Currently, the api doesn't return this information, so it will be undefined. 
              To be seen in the future 
            */
            if(['mp3','wav'].includes(extension.toLowerCase())){
              mediaInfo.songName = elt.songName;
              mediaInfo.artistName = elt.artistName;
            }

            mediasInfo.push(mediaInfo);
          });
          this.allMediasInfos.next(mediasInfo);
      } catch (error) {
          console.error("Error in getAllImages:", error);
      }
    }
  }
}
