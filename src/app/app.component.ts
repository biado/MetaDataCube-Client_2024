import { Component, Inject, OnInit, PLATFORM_ID, HostListener } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GetDimensionsService } from './services/get-dimensions.service';

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
  
  display_dimensions: boolean = true;       // If true, we show the dimensions pannel, otherwise no
  display_filters: boolean = true;          // If true, we show the filters pannel, otherwise no
  smallscreen: boolean = false;             // If true, we use the small screen version of the article tag. Otherwise we use the first version, which is the large screen version

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
      private getDimensionsService: GetDimensionsService
    ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.smallscreen = window.innerWidth < 1101;
    }
  }

  /* Used to invert the value of display_dimensions, in order to display the dimensions pannel or not. */
  display_dimensions_change(): void {
    this.display_dimensions = !this.display_dimensions;
  }

  /* Used to invert the value of display_filters, in order to display the filters pannel or not. */
  display_filters_change(): void {
    this.display_filters = !this.display_filters;
  }

  /* Used to invert the value of display_filters, in order to display the filters pannel or not. */
  async update_selection_list(): Promise<void> {
    await this.getDimensionsService.getDimensions();
    console.log("End of the update");
  }

  /* Each time the size of the browser window changes, it updates the smallscreen variable */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (isPlatformBrowser(this.platformId)) {
      this.smallscreen = window.innerWidth < 1101;
      console.log("Valeur :",this.smallscreen)
    }
  }
  
}
