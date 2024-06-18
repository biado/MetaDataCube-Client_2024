import { Injectable } from '@angular/core';
import { SelectedDimensionsService } from './selected-dimensions.service';
import { SelectedFiltersService } from './selected-filters.service';
import { Filter } from '../models/filter';
import { Tagset } from '../models/tagset';
import { BehaviorSubject, catchError, combineLatest, forkJoin, map } from 'rxjs';
import { Cell } from '../models/cell';
import { HttpClient } from '@angular/common/http';
import { SelectedAxis } from '../models/selected-axis';
import { response } from 'express';

@Injectable({
  providedIn: 'root'
})
export class GetCellsService {
  filters : Filter[] = [];
  
  selectedAxis : SelectedAxis = new SelectedAxis();

  private AxisX = new BehaviorSubject<string[]>([]);      
  /** Names we will display on the graph.component (X axis). Only the name where there is a cell. List is sort*/
  AxisX$ = this.AxisX.asObservable();

  private AxisY = new BehaviorSubject<string[]>([]);      
  /** Names we will display on the graph.component (X axis). Only the name where there is a cell. List is sort */
  AxisY$ = this.AxisY.asObservable();

  private cells = new BehaviorSubject<Cell[]>([]);
  /** List of cells corresponding at the dimensions and filters selected */
  cells$ = this.cells.asObservable();

  CoordToNameX : string[]=[];     //All the names of the AxisX sort (we will used it to ge the name of the coordinate in getContent)
  CoordToNameY : string[]=[];     //All the names of the AxisY sort (we will used it to ge the name of the coordinate in getContent)
  
  private contentUrl = new BehaviorSubject<{ [key: string]: string }>({});     
  /** Content of the graph (coordXName-coordYname : img_url of corresponding cell) */
  contentUrl$ = this.contentUrl.asObservable();

  private contentCount = new BehaviorSubject<{ [key: string]: number }>({});     
  /** Content of the graph (coordXName-coordYname : number of imgage of corresponding cell)  */
  contentCount$ = this.contentCount.asObservable();

  
  private allImagesURI = new BehaviorSubject<string[]>([]);
  /** Images URI of of all images corresponding to the selected dimensions and filters  */
  allImagesURI$ = this.allImagesURI.asObservable();



  constructor(
    private selectedFiltersService : SelectedFiltersService,
    private selectedDimensionsService : SelectedDimensionsService,
    private http: HttpClient,
  ) { 
    
    this.selectedFiltersService.filters$.subscribe(data => {
      this.filters = data;
    });

    this.selectedDimensionsService.selectedAxis$.subscribe(data => {
      this.selectedAxis = data;
    });
    
    // If selectedAxis or filters get modification, it will launch getCells
    combineLatest([
      this.selectedDimensionsService.selectedAxis$,
      this.selectedFiltersService.filters$
    ]).subscribe(async ([selectedAxis, filters]) => {
      this.getCells(filters,selectedAxis.xid, selectedAxis.xtype, selectedAxis.yid, selectedAxis.ytype);
    });
  }

  /**
   * Function that manages the entire service. It is launched each time a dimension or filter is modified. 
   * 
   * We'll create  the url corresponding to the cell display according to the dimensions/filters chosen. 
   * If the selected dimension types are not tags, then this url will be accessed.  
   * With the result, we'll first reset most of the lists to 0, then update the cell list, then retrieve the list of axisX names (CoordToNameX & AxisX). 
   * Ditto for Y. Next, we'll retrieve the contents of our table cells.
   * 
   * If the chosen dimension types are not tagset, then we'll be able to retrieve the list of all images corresponding to the chosen dimensions.
   * 
   * The various unused constants are there to make sure that typescript will wait for the end of the function to which the constant is associated 
   * before moving on (because await alone isn't enough in some cases).
   */
  private getCells(filters:Filter[],xid?: number, xtype?: 'node'|'tagset' |'tag', yid?: number, ytype?: 'node'|'tagset'|'tag'): void {
    const cellUrl = this.createCellUrl(filters,xid, xtype, yid, ytype);

    this.allImagesURI.next([]);

    if(!(xtype==='tag' || ytype==='tag')){
      const rawListCell = this.http.get(`${cellUrl}`).subscribe(
        async (response: any) => {
          this.cells.next([]);
          this.AxisX.next([]);
          this.AxisY.next([]);
          this.CoordToNameX = [];
          this.CoordToNameY = [];
          this.contentUrl.next({});
          this.contentCount.next({});
  
          response.forEach((elt : any) => {
            this.addCellToList(elt);
          });
          
          const r1 = await this.getAxisX(xid, xtype);
          const r2 = await this.getAxisY(yid, ytype);
          const r3 = this.getCellsContent();
        }
      );
    }    

    if ((xid && xtype && !(xtype==='tagset')) || (yid && ytype) && !(ytype==='tagset')) {
      const r4 = this.getAllImages(cellUrl);
    }
  }

  /**
   * Function to retrieve two lists of X axis names (CoordToNameX & AxisX) depending on the type and id of the dimensions selected.
   * 
   * Two different cases depending on whether the type is tagset or node.
   * 
   * We'll then sort the list of all names, which we'll put in CoordToNameX. 
   * Then we'll keep the names that appear only in xCoordinate cells. We'll then put this list into this.AxisX
   * 
   * .filter((name: string) => name !== response.name) is used to remove the tag with the same name as the tagset. 
   * The server will automatically remove this tag from its list before assigning the coordinates. If we don't do this too, 
   * then we'll have an offset in our alphabetical list once we've passed the tag with the tagset name.
   * 
   * 2 different ways of sorting depending on whether you have a node or tagset type. 
   * In fact, when the server assigns coordinates to cells, for a tagset it will make sure that “space” is the weakest, 
   * but when it's a node it will be the strongest if the space is in the middle of a string, if it a start or end it's the weakest. 
   * Since we use the position of words in the sorted list to determine which name corresponds to a coordinate, we need to adapt the sorting to each case.
   */  
  private async getAxisX(xid?: number, xtype?: 'node'|'tagset'|'tag'): Promise<void> {
    const NamesX: string[] = [];
  
    if (xid && xtype) {
      let AxeXUrl = `api/${xtype}/${xid}`;
      let requests;
  
      if (xtype === 'tagset') {
        requests = this.http.get(`${AxeXUrl}`).pipe(
          map((response: any) => response.tags.map((tag: any) => tag.name).filter((name: string) => name !== response.name))
        );
      } else if (xtype === 'node') {
        requests = this.http.get(`${AxeXUrl}/Children`).pipe(
          map((response: any) => response.map((node: any) => node.name))
        );
      }
  
      if (requests) {
        try {
          const results = await forkJoin(requests).toPromise();
          if(results){
            NamesX.push(...results.flat());
          }
             
          const uniqueNames = new Set<string>();
          let SortUniqueNames :string[] = [];

          if (xtype === 'node') { 
            const SortName = this.customSort(NamesX)
            this.CoordToNameX = SortName;
            this.cells.value.map((cell: any) => cell.xCoordinate).forEach((x: number) => {
              const name = SortName[x - 1];
              if (name !== undefined) {
                uniqueNames.add(name);
              }
            });    
            SortUniqueNames = this.customSort(Array.from(uniqueNames));
          } 

          else if (xtype === 'tagset') { 
            const SortName = NamesX.sort((a, b) => a.toString().localeCompare(b.toString()));
            this.CoordToNameX = SortName;
      
            const uniqueNames = new Set<string>();
            this.cells.value.map((cell: any) => cell.xCoordinate).forEach((x: number) => {
              const name = SortName[x - 1];
              if (name !== undefined) {
                uniqueNames.add(name);
              }
            });    
            SortUniqueNames = Array.from(uniqueNames).sort((a, b) => a.toString().localeCompare(b.toString()));
          }

          this.AxisX.next(SortUniqueNames);

        } catch (error) {
          console.error("Failed to fetch data", error);
        }
      }
    }
  }
  
  /**
   * Function to retrieve two lists of Y axis names (CoordToNameY & AxisY) depending on the type and id of the dimensions selected.
   * 
   * Two different cases depending on whether the type is tagset or node.
   * 
   * We'll then sort the list of all names, which we'll put in CoordToNameY. 
   * Then we'll keep the names that appear only in yCoordinate cells. We'll then put this list into this.AxisY
   * 
   * .filter((name: string) => name !== response.name) is used to remove the tag with the same name as the tagset. 
   * The server will automatically remove this tag from its list before assigning the coordinates. If we don't do this too, 
   * then we'll have an offset in our alphabetical list once we've passed the tag with the tagset name.
   * 
   * 2 different ways of sorting depending on whether you have a node or tagset type. 
   * In fact, when the server assigns coordinates to cells, for a tagset it will make sure that “space” is the weakest, 
   * but when it's a node it will be the strongest. Since we use the position of words in the sorted list to determine which name corresponds to a coordinate, 
   * we need to adapt the sorting to each case.
   */  
  private async getAxisY(yid?: number, ytype?: 'node'|'tagset'|'tag'): Promise<void> {
    const NamesY: string[] = [];
  
    if (yid && ytype) {
      let AxeYUrl = `api/${ytype}/${yid}`;
      let requests;
  
      if (ytype === 'tagset') {
        requests = this.http.get(`${AxeYUrl}`).pipe(
          map((response: any) => response.tags.map((tag: any) => tag.name).filter((name: string) => name !== response.name))
        );
      } else if (ytype === 'node') {
        requests = this.http.get(`${AxeYUrl}/Children`).pipe(
          map((response: any) => response.map((node: any) => node.name))
        );
      }
  
      if (requests) {
        try {
          const results = await forkJoin(requests).toPromise();
          if(results){
            NamesY.push(...results.flat());
          }
             
          const uniqueNames = new Set<string>();
          let SortUniqueNames :string[] = [];

          if (ytype === 'node') { 
            const SortName = this.customSort(NamesY)
            this.CoordToNameY = SortName;
            this.cells.value.map((cell: any) => cell.yCoordinate).forEach((y: number) => {
              const name = SortName[y - 1];
              if (name !== undefined) {
                uniqueNames.add(name);
              }
            });    
            SortUniqueNames = this.customSort(Array.from(uniqueNames));
          } 

          else if (ytype === 'tagset') { 
            const SortName = NamesY.sort((a, b) => a.toString().localeCompare(b.toString()));
            this.CoordToNameY = SortName;
      
            const uniqueNames = new Set<string>();
            this.cells.value.map((cell: any) => cell.yCoordinate).forEach((y: number) => {
              const name = SortName[y - 1];
              if (name !== undefined) {
                uniqueNames.add(name);
              }
            });    
            SortUniqueNames = Array.from(uniqueNames).sort((a, b) => a.toString().localeCompare(b.toString()));
          }
         
          this.AxisY.next(SortUniqueNames);

        } catch (error) {
          console.error("Failed to fetch data", error);
        }
      }
    }
  }
  
  /**
   * Function that allows you to set the correct content format for displaying the URLs and the number of images
   * of the cell images corresponding to the coordinates in the graph.component table.
   */  
  private getCellsContent(){
    const resUrl : { [key: string]: string } = {};
    const resCount : { [key: string]: number } = {};
    this.cells.value.forEach(cell => {
      if(cell.xCoordinate && cell.yCoordinate){
        const xName = this.CoordToNameX[cell.xCoordinate-1];
        const yName = this.CoordToNameY[cell.yCoordinate-1];
        if (xName && yName) {
            const key = `${xName}-${yName}`;
            resUrl[key] = cell.img_url;
            resCount[key] = cell.count;
        }
      }
      else if(cell.xCoordinate){
        const xName = this.CoordToNameX[cell.xCoordinate-1];
        if (xName) {
            const key = `${xName}`;
            resUrl[key] = cell.img_url;
            resCount[key] = cell.count;
        }
      }
      else if (cell.yCoordinate){
        const yName = this.CoordToNameY[cell.yCoordinate-1];
        if (yName) {
            const key = `${yName}`;
            resUrl[key] = cell.img_url;
            resCount[key] = cell.count;
        }
      }
    });
    this.contentUrl.next(resUrl);
    this.contentCount.next(resCount);
  }

  /**
   * Function to retrieve all images that match the selected dimensions and filters.
   */
  private async getAllImages(initUrl: string) {
    const urlAllImage: string = initUrl + '&all=[]';
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

  /**
   * Function to create api/cell url corresponding to selected dimensions and filters.
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

    //console.log("URL: ",url);
    return url;
  }
  
  /**
   * Function to add a cell to the cell list depending on what we have received from the url api/cell/... (elt is one of the objects received from this url)
   */ 
  addCellToList(elt : any): void {
    let xCo : undefined;
    let yCo : undefined;
    if(this.selectedAxis.xid && this.selectedAxis.xtype){
      xCo = elt.x;
    }    
    if(this.selectedAxis.yid && this.selectedAxis.ytype){
      yCo = elt.y;
    }
    const cell = new Cell(elt.count, elt.cubeObjects[0].fileURI,xCo,yCo);
    const currentCells = this.cells.value;
    this.cells.next([...currentCells, cell]);
  }

  /**
   * Function to define which characters are the most powerful (for custom sorting). 
   * 
   * First we have special characters, then numbers, then letters without distinction, then for the same letter lowercase before uppercase. 
   * And finally, space, which is last if it's in the middle of the word and first if it's at the beginning or end.
   */
  customSortKey(char: string, position: number, length: number): [number, number, boolean?] {
    if (char === ' ') {
        if (position === 0 || position === length - 1) {
            return [0, char.charCodeAt(0)]; // Spaces at the beginning or end are considered special characters.
        } else {
            return [4, char.charCodeAt(0)]; // Spaces in the middle are strong.
        }
    } else if (/\d/.test(char)) {
        return [1, char.charCodeAt(0)]; // Numbers after special characters.
    } else if (/[a-zA-Z]/.test(char)) {
        // Group letters case-insensitively, but lowercase before uppercase.
        return [2, char.toLowerCase().charCodeAt(0), char === char.toUpperCase()];
    } else {
        return [0, char.charCodeAt(0)]; // Special characters first
    }
  }

  /**
   * Function to sort a list of strings according to special rules defined in customSortKey.
   */
  customSort(strings: string[]): string[] {
      return strings.sort((a, b) => {
          const keyA = a.split('').map((char, index) => this.customSortKey(char, index, a.length));
          const keyB = b.split('').map((char, index) => this.customSortKey(char, index, b.length));

          for (let i = 0; i < Math.min(keyA.length, keyB.length); i++) {
              const comp = keyA[i][0] - keyB[i][0] || keyA[i][1] - keyB[i][1] || (keyA[i][2] ? 1 : 0) - (keyB[i][2] ? 1 : 0);
              if (comp !== 0) return comp;
          }

          return keyA.length - keyB.length;
      });
  }

}
