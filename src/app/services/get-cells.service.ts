import { Injectable } from '@angular/core';
import { SelectedFiltersService } from './selected-filters.service';
import { Filter } from '../models/filter';
import { BehaviorSubject, combineLatest, forkJoin, map } from 'rxjs';
import { Cell } from '../models/cell';
import { HttpClient } from '@angular/common/http';
import { SelectedDimensions } from '../models/selected-dimensions';
import { GetUrlToSelectedDimensionsOrCellStateService } from './get-url-to-selected-dimensions-or-cell-state.service';

@Injectable({
  providedIn: 'root'
})

export class GetCellsService {
  filters : Filter[] = [];
  
  selectedDimensions : SelectedDimensions = new SelectedDimensions();

  private AxisX = new BehaviorSubject<string[]>([]);      
  /** Names we will display on the cells-display.component (X axis). Only the name where there is a cell. List is sort*/
  AxisX$ = this.AxisX.asObservable();

  private AxisY = new BehaviorSubject<string[]>([]);      
  /** Names we will display on the cells-display.component (Y axis). Only the name where there is a cell. List is sort */
  AxisY$ = this.AxisY.asObservable();

  private cells : Cell[] = [];    // List of the cells get from the server

  CoordToNameX : string[]=[];     //All the names of the AxisX sort (we will used it to ge the name of the coordinate in getContent)
  CoordToNameY : string[]=[];     //All the names of the AxisY sort (we will used it to ge the name of the coordinate in getContent)
  
  private cellsContentUrl = new BehaviorSubject<{ [key: string]: string }>({});     
  /** Content of the table of cells-display (coordXName-coordYname : img_url of corresponding cell) */
  cellsContentUrl$ = this.cellsContentUrl.asObservable();

  private cellsContentCount = new BehaviorSubject<{ [key: string]: number }>({});     
  /** Content of the table of cells-display (coordXName-coordYname : number of imgage of corresponding cell)  */
  cellsContentCount$ = this.cellsContentCount.asObservable();

  
  constructor(
    private selectedFiltersService : SelectedFiltersService,
    private getUrlToSelectedDimensionsOrCellStateService : GetUrlToSelectedDimensionsOrCellStateService,
    private http: HttpClient,
  ) { 
    
    this.selectedFiltersService.filters$.subscribe(data => {
      this.filters = data;
    });

    /**
     * We retrieve the selectedDimensions from getUrlSelectedDimensionsService and not from selectedDimensionsService, 
     * as the getUrl contains the url we need for the api/cell request (see the getUrl service to understand why we can't use selectedDimensions Service).
     */
    this.getUrlToSelectedDimensionsOrCellStateService.selectedDimensionsWithUrl$.subscribe(data => {
      this.selectedDimensions = data;
    });
    
    // If selectedDimensions or filters get modification, it will launch getCells
    combineLatest([
      this.getUrlToSelectedDimensionsOrCellStateService.selectedDimensionsWithUrl$,
      this.selectedFiltersService.filters$
    ]).subscribe(async ([selectedDimensions, filters]) => {
      this.getCells(filters,selectedDimensions.url,selectedDimensions.xid, selectedDimensions.xtype, selectedDimensions.yid, selectedDimensions.ytype);
    });
  }

  /**
   * Function that manages the entire service. It is launched each time a dimension or filter is modified. 
   * 
   * If the selected dimension types are not tags, then this url will be accessed.  
   * With the result, we'll first reset most of the lists to 0, then update the cell list, then retrieve the list of axisX names (CoordToNameX & AxisX). 
   * Ditto for Y. Next, we'll retrieve the contents of our table cells.
   * 
   * If the chosen dimension types are not tagset, then we'll be able to retrieve the list of all images corresponding to the chosen dimensions.
   * 
   * The various unused constants are there to make sure that typescript will wait for the end of the function to which the constant is associated 
   * before moving on (because await alone isn't enough in some cases).
   */
  private getCells(filters:Filter[],url: string,xid?: number, xtype?: 'node'|'tagset' |'tag', yid?: number, ytype?: 'node'|'tagset'|'tag'): void {
    if(!(xtype==='tag' || ytype==='tag')){
      const rawListCell = this.http.get(`${url}`).subscribe(
        async (response: any) => {
          this.cells = [];
          this.AxisX.next([]);
          this.AxisY.next([]);
          this.CoordToNameX = [];
          this.CoordToNameY = [];
          this.cellsContentCount.next({});
          this.cellsContentCount.next({});
  
          response.forEach((elt : any) => {
            this.addCellToList(elt);
          });
          
          const r1 = await this.getAxisX(xid, xtype);
          const r2 = await this.getAxisY(yid, ytype);
          const r3 = this.getCellsContent();
        }
      );
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
   * For tagsets, the Order By performed in the sql query brings us closer to a classic alphabetical sort (symbols < numbers < letters (aAbcDE...).
   * For node, the request is a classic "Order By name". We're therefore using SQL's "Order by" sorting method, 
   * which is a bit special (see the sql_OrderBy_sort() function for an explanation).
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
            const SortName = this.sql_OrderBy_Sort(NamesX)
            this.CoordToNameX = SortName;
            this.cells.map((cell: any) => cell.xCoordinate).forEach((x: number) => {
              const name = SortName[x - 1];
              if (name !== undefined) {
                uniqueNames.add(name);
              }
            });    
            SortUniqueNames = this.sql_OrderBy_Sort(Array.from(uniqueNames));
          } 

          else if (xtype === 'tagset') { 
            const SortName = NamesX.sort((a, b) => a.toString().localeCompare(b.toString()));
            this.CoordToNameX = SortName;
      
            const uniqueNames = new Set<string>();
            this.cells.map((cell: any) => cell.xCoordinate).forEach((x: number) => {
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
   * For tagsets, the Order By performed in the sql query brings us closer to a classic alphabetical sort (symbols < numbers < letters (aAbcDE...).
   * For node, the request is a classic "Order By name". We're therefore using SQL's "Order by" sorting method, 
   * which is a bit special (see the sql_OrderBy_sort() function for an explanation).
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
            const SortName = this.sql_OrderBy_Sort(NamesY)
            this.CoordToNameY = SortName;
            this.cells.map((cell: any) => cell.yCoordinate).forEach((y: number) => {
              const name = SortName[y - 1];
              if (name !== undefined) {
                uniqueNames.add(name);
              }
            });    
            SortUniqueNames = this.sql_OrderBy_Sort(Array.from(uniqueNames));
          } 

          else if (ytype === 'tagset') { 
            const SortName = NamesY.sort((a, b) => a.toString().localeCompare(b.toString()));
            this.CoordToNameY = SortName;
      
            const uniqueNames = new Set<string>();
            this.cells.map((cell: any) => cell.yCoordinate).forEach((y: number) => {
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
   * of the cell images corresponding to the coordinates in cells-display.component table.
   */  
  private getCellsContent(){
    const resUrl : { [key: string]: string } = {};
    const resCount : { [key: string]: number } = {};
    this.cells.forEach(cell => {
      if(cell.xCoordinate && cell.yCoordinate){
        const xName = this.CoordToNameX[cell.xCoordinate-1];
        const yName = this.CoordToNameY[cell.yCoordinate-1];
        if (xName && yName) {
            const key = `${xName}-${yName}`;
            resUrl[key] = cell.file_uri;
            resCount[key] = cell.count;
        }
      }
      else if(cell.xCoordinate){
        const xName = this.CoordToNameX[cell.xCoordinate-1];
        if (xName) {
            const key = `${xName}`;
            resUrl[key] = cell.file_uri;
            resCount[key] = cell.count;
        }
      }
      else if (cell.yCoordinate){
        const yName = this.CoordToNameY[cell.yCoordinate-1];
        if (yName) {
            const key = `${yName}`;
            resUrl[key] = cell.file_uri;
            resCount[key] = cell.count;
        }
      }
    });
    this.cellsContentUrl.next(resUrl);
    this.cellsContentCount.next(resCount);
  }
  
  /**
   * Function to add a cell to the cell list depending on what we have received from the url api/cell/... (elt is one of the objects received from this url)
   */ 
  addCellToList(elt : any): void {
    let xCo : undefined;
    let yCo : undefined;
    if(this.selectedDimensions.xid && this.selectedDimensions.xtype){
      xCo = elt.x;
    }    
    if(this.selectedDimensions.yid && this.selectedDimensions.ytype){
      yCo = elt.y;
    }
    const cell = new Cell(elt.count, elt.cubeObjects[0].fileURI,xCo,yCo);
    const currentCells = this.cells;
    this.cells = [...currentCells, cell];
  }


  /**
  * Function to sort a list in the same way as SQL's "Order By".
  * 
  * Order By de SQL sort in this way: delete the symbols and change everything to lower case. Once this is done, we perform a first sort.
  * From this initial sorting, common groups emerge, which we'll retrieve, and then re-sort each groups, this time with upper case and Symbols.
  * 
  * Ex : ["A0","a1", "a 1", "A1", "A 1","A2"] --> First Sort --> ["a0","a1","a1","a1","a1","a2"] --> Second Sort --> ["A0","a 1","a1","A 1","A1","A2"]
  */
  sql_OrderBy_Sort(list: string[]): string[] {

    /* Internal Functions  */    
        /** 
         * Arrow function for sort function. Compares two strings in a customized order (the aim is to resemble SQL's "Order By" order).
         * 
         * Here, we will only have chain without Symbols and UpperCase letters.
         */
        const customCompare_WithoutSymbolsAndUpperCaseLetters = (a: string, b: string): number =>{
          const customOrder = [
            '$','£','€',
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'a', 'à', 'á', 'â', 'ã', 'ä', 'å', 'æ','b','c', 'ç','d', 'e', 'è', 'é', 'ê', 'ë', 'f', 'g', 'h', 'i', 'ì', 'í', 'î', 'ï', 'j', 
            'k', 'l', 'm', 'n', 'ñ', 'o', 'ò', 'ó', 'ô', 'õ', 'ö', 'p', 'q', 'r', 's', 't','u', 'ù', 'ú', 'û', 'ü', 'v', 'w', 'x','y', 'ý', 'ÿ','z'
          ]

          const cleanA = removeSymbolsAndLowerCase(a);
          const cleanB = removeSymbolsAndLowerCase(b);

          const maxLength = Math.max(cleanA.length, cleanB.length);
          
          for (let i = 0; i < maxLength; i++) {
            const charA = cleanA[i] || ''; // Si a est plus court, charA est ''
            const charB = cleanB[i] || ''; // Si b est plus court, charB est ''
            
            const indexA = customOrder.indexOf(charA);
            const indexB = customOrder.indexOf(charB);
            
            if (indexA !== indexB) {
              return indexA - indexB;
            }
          }
          
          return 0; // Les deux mots sont égaux
        }

        /**
         * Arrow function for sort function. Compares two strings in a customized order (the aim is to resemble SQL's "Order By" order).
         * 
         * In this case, we take everything, symbols, numbers and letters.
         */
        const customCompare_WithUpperAndSymbol = (a: string, b: string): number =>{
          const customOrder = [
            ' ', '!', '"', '#', '%', '&', '\'', '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '{', '|', '}','§',
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '$','£','€',
            'a', 'à', 'á', 'â', 'ã', 'ä', 'å', 'æ', 'b', 'c', 'ç', 'd', 'e', 'è', 'é', 'ê', 'ë', 'f', 'g', 'h', 'i', 'ì', 'í', 'î', 'ï', 'j', 'k', 'l', 'm', 'n', 'ñ', 'o', 'ò', 'ó', 'ô', 'õ', 'ö', 'p', 'q', 'r', 's', 't', 'u', 'ù', 'ú', 'û', 'ü', 'v', 'w', 'x', 'y', 'ý', 'ÿ', 'z',
            'A', 'À', 'Á', 'Â', 'Ã', 'Ä', 'Å', 'Æ', 'B', 'C', 'Ç', 'D', 'E', 'È', 'É', 'Ê', 'Ë', 'F', 'G', 'H', 'I', 'Ì', 'Í', 'Î', 'Ï', 'J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'Ò', 'Ó', 'Ô', 'Õ', 'Ö', 'P', 'Q', 'R', 'S', 'T', 'U', 'Ù', 'Ú', 'Û', 'Ü', 'V', 'W', 'X', 'Y', 'Ý', 'Z'
          ];

          const maxLength = Math.max(a.length, b.length);
          
          for (let i = 0; i < maxLength; i++) {
            const charA = a[i] || ''; // If a is shorter, charA is ''.
            const charB = b[i] || ''; // If b is shorter, charB is ''.
            
            const indexA = customOrder.indexOf(charA);
            const indexB = customOrder.indexOf(charB);
            
            if (indexA !== indexB) {
              return indexA - indexB;
            }
          }
          
          return 0; // Both words are equal
        }

        /**
         * Function to retrieve groups of identical names (without symbols and capital letters), 
         * take their version with symbols and capital letters and then re-sort these groups and make modifications to the original list (if the order change).
         */
        function sortSameGroupsWithUpperAndSymbols(cleanAndSortedStrings: string[], originalList: string[]): string[] {
          // Step 1: Group indices of identical strings from cleanAndSortedStrings
          const indexMap: { [key: string]: number[] } = {};

          cleanAndSortedStrings.forEach((str, index) => {
              if (!indexMap[str]) {
                  indexMap[str] = [];
              }
              indexMap[str].push(index);
          });

          // Step 2: Sort and rearrange originalList based on grouped indices    
          Object.keys(indexMap).forEach(key => {
              const indices = indexMap[key];
              if (indices.length > 1) {
                  // Collect original strings corresponding to these indices
                  const stringsToSort = indices.map(idx => originalList[idx]);
                  // Sort them with a personalized sort
                  stringsToSort.sort(customCompare_WithUpperAndSymbol);
                  // Replace originalList with sorted strings at their original indices
                  indices.forEach((idx, i) => {
                      originalList[idx] = stringsToSort[i];
                  });
              }
          });
          return originalList;    
        }        

        /**
         * Remove all the symbols of a string and put it in lowercase
         */
        function removeSymbolsAndLowerCase(str: string): string {
          const res = str.replace(/[\s!"#%&'()*+,-./:;<=>?@\[\\\]^_{|}]/g, '').toLowerCase();
          return res;
        }



    /* Body of sql_OrderBy_sort function */

    // Step 1 : Sort Without Symbols and UpperCase
    const originalList = list.sort(customCompare_WithoutSymbolsAndUpperCaseLetters);

    let listSortWithoutSymbolandUpper :string[]= []

    originalList.forEach(elt =>{
      listSortWithoutSymbolandUpper.push(removeSymbolsAndLowerCase(elt));
    })

    //Step 2  : Sort With Symbols and UpperCase
    const newList = sortSameGroupsWithUpperAndSymbols(listSortWithoutSymbolandUpper, originalList);

    return newList;
  }

  

  


}
