import { Component, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GetTagsetListService } from '../../services/get-tagset-list.service';
import { Router } from '@angular/router';
import { UndoRedoService } from '../../services/undo-redo.service';

@Component({
  selector: 'app-browsing-state',
  templateUrl: './browsing-state.component.html',
  styleUrl: './browsing-state.component.css'
})
export class BrowsingStateComponent {
  
  /** If true, we show the dimensions pannel, otherwise no */
  display_dimensions: boolean = true;

  /** If true, we show the filters pannel, otherwise no */
  display_filters: boolean = true;     

  /** If true, we use the small screen version of the article tag. Otherwise we use the first version, which is the large screen version */
  smallscreen: boolean = false;             


  constructor(
      private router: Router,
      @Inject(PLATFORM_ID) private platformId: Object,
      private getTagsetListService: GetTagsetListService,
      private undoredoService : UndoRedoService,
    ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.smallscreen = window.innerWidth < 1101;
    }
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

  undo(){
    this.undoredoService.undo();
  }

  redo(){
    this.undoredoService.redo();
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
   * Change variables to display the grid component instead of the graph component.
   */
  go_to_cellState_Page():void{
    this.router.navigate(['/cell-state']);
  }

  
}
