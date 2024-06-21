import { Injectable } from '@angular/core';
import { Filter } from '../models/filter';
import { SelectedAxis } from '../models/selected-axis';
import { SelectedFiltersService } from './selected-filters.service';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CellsDisplayComponent } from '../components/browsing-state/cells-display/cells-display.component';

@Injectable({
  providedIn: 'root'
})
export class GetCellStateService {
  
  filters : Filter[] = [];
  
  private allImagesURI = new BehaviorSubject<string[]>([]);
  /** Images URI of of all images corresponding to the selected dimensions and filters  */
  allImagesURI$ = this.allImagesURI.asObservable();


  selectedCellAxis: BehaviorSubject<SelectedAxis> = new BehaviorSubject<SelectedAxis>(new SelectedAxis());
  /** Dimensions of the cell from which you want to see all the images.   */
  selectedCellAxis$: Observable<SelectedAxis> = this.selectedCellAxis.asObservable();


  constructor(
    private selectedFiltersService : SelectedFiltersService,
    private http: HttpClient,
  ) { 
    this.selectedFiltersService.filters$.subscribe(data => {
      this.filters = data;
    });
    
    // If selectedCellAxis or filters get modification, it will launch getCells
    combineLatest([
      this.selectedCellAxis$,
      this.selectedFiltersService.filters$
    ]).subscribe(([selectedCellAxis, filters]) => {
      this.getAllImages(selectedCellAxis,filters);
    });
  }

  /**
   * Function to retrieve all images that match the selected dimensions and filters.
   */
  private async getAllImages(selectedCellAxis : SelectedAxis, filters : Filter[]) {
    if ((selectedCellAxis.xid && selectedCellAxis.xtype && !(selectedCellAxis.xtype==='tagset')) || (selectedCellAxis.yid && selectedCellAxis.ytype) && !(selectedCellAxis.ytype==='tagset')) {
      const urlAllImage: string = this.createCellUrl(filters,selectedCellAxis.xid,selectedCellAxis.xtype,selectedCellAxis.yid,selectedCellAxis.ytype);
      console.log("URL :",urlAllImage)
      this.allImagesURI.next([]);
      let imagesURIs: string[] = [];

      try {
          const response: any = await this.http.get(`${urlAllImage}`).toPromise();
          response.forEach((elt: any) => {
              imagesURIs.push(elt.fileURI);
          });
          this.allImagesURI.next(imagesURIs);
      } catch (error) {
          console.error("Error in getAllImages:", error);
      }
    }
  }

  /**
   * Function to create api/cell/...&all=[] url corresponding to selected dimensions and filters.
   */ 
  private createCellUrl( filters:Filter[],xid?: number, xtype?: 'node'|'tagset'|'tag', yid?: number, ytype?: 'node'|'tagset'|'tag') : string{
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
    url = url+ '&all=[]'


    //console.log("URL: ",url);
    return url;
  }




}
