import { Component } from '@angular/core';
import { Filter } from '../../models/filter';
import { SelectedFiltersService } from '../../services/selected-filters.service';
import { SelectedDimensionsService } from '../../services/selected-dimensions.service';
import { GetGraphService } from '../../services/get-graph.service';
import { SelectedAxis } from '../../models/selected-axis';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css'
})

export class GraphComponent {
  filters:Filter[]=[];

  selectedAxis : SelectedAxis = new SelectedAxis();

  AxisX: string[] = [];
  AxisY: string[] = [];
  
  /**For x name and y name (of AxixX & AxixY we get the corresponding url (--See getGraphService--)). */
  content: { [key: string]: string } = {};    

  /**graph.component.html will go straight inside. Used to avoid looking directly into content, or calling a function directly (because <img src=...> will continuously call the function). */ 
  imageUrls: { [key: string]: string } = {}; 

  /** For each x-y duo, we check whether the image is loading or not (starts at true, changes to false as soon as the image is loaded (or there's an error)). */
  isLoading: { [key: string]: boolean } = {};

  /** For each x-y duo, If loading the image causes an error, set to true. False otherwise. */
  isError: { [key: string]: boolean } = {};


  constructor(
    private selectedFiltersService : SelectedFiltersService,
    private selectedDimensionsService : SelectedDimensionsService,
    private getGraphService : GetGraphService,
    private http: HttpClient,
  ){}


  async ngOnInit(): Promise<void> {    
    this.selectedFiltersService.filters$.subscribe(data => {
      this.filters = data;
    });
    this.selectedDimensionsService.selectedAxis$.subscribe(data => {
      this.selectedAxis = data;
    });
    this.getGraphService.AxisX$.subscribe(async data => {
      this.AxisX = data;
    });
    this.getGraphService.AxisY$.subscribe(async data => {
      this.AxisY = data;
    });
    this.getGraphService.content$.subscribe(async data => {
      this.content = data;
    });

    // If AxixX, Y or contents get update, it will launch getImagesURL. That way we're sure to have the latest version.
    combineLatest([
      this.getGraphService.AxisX$,
      this.getGraphService.AxisY$,
      this.getGraphService.content$,
    ]).subscribe(([x, y,content]) => {
      this.getImagesURL(x,y);
    });

  }


  /**
   * Each time a dimension changes or the content is updated, this function is called.
   * 
   * Initializes isLoading and isError and loads image urls into imageUrls with getContent.
   * 
   * This function ensures that the images displayed are the most recent, without allowing <img> to continually launch a function
   */
  getImagesURL(x:string[],y:string[]){
    this.imageUrls = {};
    this.isLoading = {};
    this.isError = {};
    if(x && x.length > 0 && y && y.length > 0){
      x.forEach(x => {
        y.forEach(y => {
          const key = `${x}-${y}`;
          this.imageUrls[key] = this.getContent(key);
          this.isLoading[key] = true;
          this.isError[key] = false;
        });
      });
    }
    else if(x && x.length > 0){
      x.forEach(x => {
        const key = `${x}`;
        this.imageUrls[key] = this.getContent(x);
        this.isLoading[key] = true;
        this.isError[key] = false;
      });
    }
    else if(y && y.length > 0){
      y.forEach(y => {
        const key = `${y}`;
        this.imageUrls[key] = this.getContent(y);
        this.isLoading[key] = true;
        this.isError[key] = false;
      });
    }
    
  }

  /**
   * This function returns the url corresponding to one cell in the table (duo x-y) using content and baseurl (to be modified by hand depending on where the images are stored).
   * 
   * Returns the url if there is one, if there are no results for the cells in the array, then an empty string is returned.
   */
  getContent(key:string): string {
    // Test code to check whether the display is correct in html. Take a random number between 1 and 7. We have 6 test images. 
    // We'll be able to test the display of different images and check that if we can't find the image we'll get an error display.
    /*const rand = this.getRandomInt(1,7)
    if(this.content[`${key}`]){
      return `assets/images/test${rand}.jpg`;
    }
    return '';*/
    
    // Actual function code, which returns the url corresponding to the cell image.
    let baseurl = `assets/images/lsc_thumbs512/thumbnails512/`;
    const url = this.content[key];
    if(url){
      console.log(baseurl+url);
      return baseurl+url;
    }
    return '';
  }

  /** Function launched when an image is correctly loaded. We'll then set the isLoading and isError of the corresponding array cell to false. */
  onLoad(key: string) {
    this.isLoading[key] = false;
    this.isError[key] = false;
  }

  /** Function launched when there's an error loading the image. We'll then set the isLoading to False and isError on true of the corresponding array cell to false. */
  onError(key: string) {
    this.isLoading[key] = false;
    this.isError[key] = true;
  }

  /** Function for randomizing two digits. Use to test image display (for url in getcontent) */
  getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
