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
  
  content: { [key: string]: string } = {};

  imageUrls: { [key: string]: string } = {};
  isLoading: { [key: string]: boolean } = {};
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

    combineLatest([
      this.getGraphService.AxisX$,
      this.getGraphService.AxisY$,
      this.getGraphService.content$,
    ]).subscribe(([x, y,content]) => {
      this.getImagesURL(x,y);
    });

  }


  getImagesURL(x:string[],y:string[]){
    this.imageUrls = {};
    this.isLoading = {};
    this.isError = {};
    x.forEach(x => {
      y.forEach(y => {
        const key = `${x}-${y}`;
        this.imageUrls[key] = this.getContent(x, y);
        this.isLoading[key] = true;
        this.isError[key] = false;
      });
    });
    console.log("ImgURL : ",this.imageUrls);
    console.log("AxisX : ",x);
    console.log("AxisY : ",y);
  }


  getContent(x: string, y: string): string {
    const rand = this.getRandomInt(1,7)
    if(this.content[`${x}-${y}`]){
      console.log()
      return `assets/images/test${rand}.jpg`;
    }
    return '';
    
    /*let baseurl = `http://bjth.itu.dk:5007/`;
    const url = this.content[`${x}-${y}`];
    if(url){
      console.log("img_url :",baseurl+url);
      return baseurl+url;
    }
    console.log("img_url : ",'');
    return '';*/
  }


  onLoad(key: string) {
    this.isLoading[key] = false;
    this.isError[key] = false;
  }


  onError(key: string) {
    this.isLoading[key] = false;
    this.isError[key] = true;
  }
  

  getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
