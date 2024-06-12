import { Component, Inject, OnInit, PLATFORM_ID, HostListener } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GetTagsetListService } from './services/get-tagset-list.service';
import { GetGraphService } from './services/get-graph.service';
import { SelectedAxis } from './models/selected-axis';
import { SelectedDimensionsService } from './services/selected-dimensions.service';

interface Element {
  id: number;
  name: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  /** If true, we show the dimensions pannel, otherwise no */
  display_dimensions: boolean = true;

  /** If true, we show the filters pannel, otherwise no */
  display_filters: boolean = true;     

  /** If true, we use the small screen version of the article tag. Otherwise we use the first version, which is the large screen version */
  smallscreen: boolean = false;             

  /** Variable to display the grid if true, hide it if false. */
  display_grid : boolean = false;
  
  /** Variable to display the graph if true, hide it if false. */
  display_graph : boolean = true;

  selectedAxis : SelectedAxis = new SelectedAxis();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
      private getTagsetListService: GetTagsetListService,
      private selectedDimensionsService : SelectedDimensionsService,
    ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.smallscreen = window.innerWidth < 1101;
    }

    this.selectedDimensionsService.selectedAxis$.subscribe(data => {
      this.selectedAxis = data;
    });
  }

  /**
   * Used to invert the value of display_dimensions, in order to display the dimensions pannel or not.
   */
  display_dimensions_change(): void {
    this.display_dimensions = !this.display_dimensions;
  }

  /**
   * Used to invert the value of display_filters, in order to display the filters pannel or not.
   */
  display_filters_change(): void {
    this.display_filters = !this.display_filters;
  }

  /**
   * Used to invert the value of display_filters, in order to display the filters pannel or not. 
   */ 
  async refresh_selection_list(): Promise<void> {
    await this.getTagsetListService.getTagsetList();
    console.log("End of refresh");
  }

  co(){
  }

  /** 
   * Each time the size of the browser window changes, it updates the smallscreen variable 
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (isPlatformBrowser(this.platformId)) {
      this.smallscreen = window.innerWidth < 1101;
    }
  }

  /**
   * Change variables to display the graph component instead of the grid component.
   */
  show_graph():void{
    if(!(this.selectedAxis.xtype==="tag"||this.selectedAxis.ytype==='tag')){
      this.display_graph = true;
      this.display_grid = false;
    }
  }

  /**
   * Change variables to display the grid component instead of the graph component.
   */
  show_grid():void{
    if(!(this.selectedAxis.xtype==="tagset"||this.selectedAxis.ytype==='tagset')){
      this.display_graph = false;
      this.display_grid = true;
    }
  }

  
}
