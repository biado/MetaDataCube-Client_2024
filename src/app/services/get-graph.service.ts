import { Injectable } from '@angular/core';
import { SelectedDimensionsService } from './selected-dimensions.service';
import { SelectedFiltersService } from './selected-filters.service';
import { Filter } from '../models/filter';
import { Tagset } from '../models/tagset';
import { BehaviorSubject, combineLatest, forkJoin, map } from 'rxjs';
import { Cell } from '../models/cell';
import { HttpClient } from '@angular/common/http';
import { SelectedAxis } from '../models/selected-axis';

@Injectable({
  providedIn: 'root'
})
export class GetGraphService {
  filters : Filter[] = [];
  
  selectedAxis : SelectedAxis = new SelectedAxis();

  private AxisX = new BehaviorSubject<string[]>([]);      // Names we will display on the graph.component (X axis). Only the name where there is a cell. List is sort
  AxisX$ = this.AxisX.asObservable();

  private AxisY = new BehaviorSubject<string[]>([]);      // Names we will display on the graph.component (X axis). Only the name where there is a cell. List is sort
  AxisY$ = this.AxisY.asObservable();

  private cells = new BehaviorSubject<Cell[]>([]);
  cells$ = this.cells.asObservable();

  CoordToNameX : string[]=[];     //All the names of the AxisX sort (we will used it to ge the name of the coordinate in getContent)
  CoordToNameY : string[]=[];     //All the names of the AxisY sort (we will used it to ge the name of the coordinate in getContent)
  
  private content = new BehaviorSubject<{ [key: string]: string }>({});     //Content of the graph (coordXName-coordYname : img_url of corresponding cell)
  content$ = this.content.asObservable();



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
   * We'll create and access the url corresponding to the cell display according to the dimensions/filters chosen. 
   * With the result, we'll first reset most of the lists to 0, then update the cell list, then retrieve the list of axisX names (CoordToNameX & AxisX). 
   * Ditto for Y. Next, we'll retrieve the contents of our table cells.
   * 
   * The various unused constants are there to make sure that typescript will wait for the end of the function to which the constant is associated 
   * before moving on (because await alone isn't enough in some cases).
   */
  private getCells(filters:Filter[],xid?: number, xtype?: 'node'|'tagset', yid?: number, ytype?: 'node'|'tagset'): void {
    const cellUrl = this.createCellUrl(filters,xid, xtype, yid, ytype);
    const rawListCell = this.http.get(`${cellUrl}`).subscribe(
      async (response: any) => {
        this.cells.next([]);
        this.AxisX.next([]);
        this.AxisY.next([]);
        this.CoordToNameX = [];
        this.CoordToNameY = [];
        this.content.next({});
        response.forEach((elt : any) => {
          this.addCellToList(elt);
        });
        const r1 = await this.getAxeX(xid, xtype);
        const r2 = await this.getAxeY(yid, ytype);
        const r3 = this.getContent();
      });
  }

  /**
   * Function to retrieve two lists of X axis names (CoordToNameX & AxisX) depending on the type and id of the dimensions selected.
   * 
   * Two different cases depending on whether the type is tagset or node.
   * 
   * Wait 100ms, because if you go too fast, you lose data.
   * 
   * We'll then sort the list of all names, which we'll put in CoordToNameX. 
   * Then we'll keep the names that appear only in xCoordinate cells. We'll then put this list into this.AxisX
   * 
   * .filter((name: string) => name !== '') is used to remove an empty string. In fact, the retrieved data may contain an empty string. 
   * However, when the request is made to obtain the cells, the server will automatically remove this empty string from the equation. 
   * To make the association, we need to do the same.
   */  
  private async getAxeX(xid?: number, xtype?: 'node'|'tagset'): Promise<void> {
    const NamesX: string[] = [];
  
    if (xid && xtype) {
      let AxeXUrl = `api/${xtype}/${xid}`;
      let requests;
  
      if (xtype === 'tagset') {
        requests = this.http.get(`${AxeXUrl}`).pipe(
          map((response: any) => response.tags.map((tag: any) => tag.name).filter((name: string) => name !== ''))
        );
      } else if (xtype === 'node') {
        requests = this.http.get(`${AxeXUrl}/Children`).pipe(
          map((response: any) => response.map((node: any) => node.name).filter((name: string) => name !== ''))
        );
      }
  
      if (requests) {
        try {
          const results = await forkJoin(requests).toPromise();
          if(results){
            NamesX.push(...results.flat());
          }
  
          const SortName = NamesX.sort((a, b) => a.toString().localeCompare(b.toString()));
          this.CoordToNameX = SortName;
  
          const uniqueNames = new Set<string>();
          this.cells.value.map((cell: any) => cell.xCoordinate).forEach((x: number) => {
            const name = SortName[x - 1];
            if (name !== undefined) {
              uniqueNames.add(name);
            }
          });
  
          const SortFilterName = Array.from(uniqueNames).sort((a, b) => a.toString().localeCompare(b.toString()));
          this.AxisX.next(SortFilterName);

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
   * Wait 100ms, because if you go too fast, you lose data.
   * 
   * We'll then sort the list of all names, which we'll put in CoordToNameY. 
   * Then we'll keep the names that appear only in yCoordinate cells. We'll then put this list into this.AxisY
   * 
   * .filter((name: string) => name !== '') is used to remove an empty string. In fact, the retrieved data may contain an empty string. 
   * However, when the request is made to obtain the cells, the server will automatically remove this empty string from the equation. 
   * To make the association, we need to do the same.
   */  
  private async getAxeY(yid?: number, ytype?: 'node'|'tagset'): Promise<void> {
    const NamesY: string[] = [];
  
    if (yid && ytype) {
      let AxeYUrl = `api/${ytype}/${yid}`;
      let requests;
  
      if (ytype === 'tagset') {
        requests = this.http.get(`${AxeYUrl}`).pipe(
          map((response: any) => response.tags.map((tag: any) => tag.name).filter((name: string) => name !== ''))
        );
      } else if (ytype === 'node') {
        requests = this.http.get(`${AxeYUrl}/Children`).pipe(
          map((response: any) => response.map((node: any) => node.name).filter((name: string) => name !== ''))
        );
      }
  
      if (requests) {
        try {
          const results = await forkJoin(requests).toPromise();
          if(results){
            NamesY.push(...results.flat());
          }
  
          const SortName = NamesY.sort((a, b) => a.toString().localeCompare(b.toString()));
          this.CoordToNameY = SortName;
  
          const uniqueNames = new Set<string>();
          this.cells.value.map((cell: any) => cell.yCoordinate).forEach((y: number) => {
            const name = SortName[y - 1];
            if (name !== undefined) {
              uniqueNames.add(name);
            }
          });
  
          const SortFilterName = Array.from(uniqueNames).sort((a, b) => a.toString().localeCompare(b.toString()));
          this.AxisY.next(SortFilterName);

        } catch (error) {
          console.error("Failed to fetch data", error);
        }
      }
    }
  }
  
  /**
   * Function that allows you to set the correct content format for displaying the URLs 
   * of the cell images corresponding to the coordinates in the graph.component table.
   */  
  private getContent(){
    const res : { [key: string]: string } = {};
    this.cells.value.forEach(cell => {
      if(cell.xCoordinate && cell.yCoordinate){
        const xName = this.CoordToNameX[cell.xCoordinate-1];
        const yName = this.CoordToNameY[cell.yCoordinate-1];
        if (xName && yName) {
            const key = `${xName}-${yName}`;
            res[key] = cell.img_url;
        }
      }
      else if(cell.xCoordinate){
        const xName = this.CoordToNameX[cell.xCoordinate-1];
        if (xName) {
            const key = `${xName}`;
            res[key] = cell.img_url;
        }
      }
      else if (cell.yCoordinate){
        const yName = this.CoordToNameY[cell.yCoordinate-1];
        if (yName) {
            const key = `${yName}`;
            res[key] = cell.img_url;
        }
      }
    });
    this.content.next(res);
  }
  
  /**
   * Function to create api/cell url corresponding to selected dimensions and filters.
   */ 
  private createCellUrl( filters:Filter[],xid?: number, xtype?: 'node'|'tagset', yid?: number, ytype?: 'node'|'tagset') : string{
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
   * Wait function. Take ms (1000 millisecondes = 1 secondes)
   */
  async waitNSeconds(N:number): Promise<void> {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, N);
    });
  }

}
