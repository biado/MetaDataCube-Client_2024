import { Component, Inject, OnInit, PLATFORM_ID, HostListener } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

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
  
  display_dimensions: boolean = true;
  display_filters: boolean = true;
  smallscreen: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.smallscreen = window.innerWidth < 1101;
    }
  }

  display_dimensions_change(): void {
    this.display_dimensions = !this.display_dimensions;
  }

  display_filters_change(): void {
    this.display_filters = !this.display_filters;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (isPlatformBrowser(this.platformId)) {
      this.smallscreen = window.innerWidth < 1101;
      console.log("Valeur :",this.smallscreen)
    }
  }
  
}
