import { Component } from '@angular/core';
import { GetGraphService } from '../../services/get-graph.service';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.css'
})
export class GridComponent {

  imagesURI: string[] = [];

  constructor(
    private getGraphService : GetGraphService,
  ){}

  async ngOnInit(): Promise<void> {    
    this.getGraphService.allImagesURI$.subscribe(data => {
      this.imagesURI = this.getCompleteUrl(data);
    });
  }

  getCompleteUrl(URIs:string[]): string[]{
    let baseurl = `assets/images/lsc_thumbs512/thumbnails512/`;
    let res : string[] = [];
    URIs.forEach(uri => {
      res.push(baseurl+uri);
    });
    return res;
  }

}
