import { Component } from '@angular/core';
import { GetCellsService } from '../../services/get-cells.service';
import { combineLatest } from 'rxjs';
import { GetCellStateService } from '../../services/get-cell-state.service';
import { ImageInfos } from '../../models/image-infos';

@Component({
  selector: 'app-cell-state',
  templateUrl: './cell-state.component.html',
  styleUrl: './cell-state.component.css'
})
export class CellStateComponent {

  imagesInfos: ImageInfos[] = [];
  /** Image selected in the grid. The image is kept in memory even when you return to the grid, so as not to lose it when you change view. */
  currentImage: ImageInfos = new ImageInfos("");     

  display_grid : boolean = true;
  display_single : boolean = false;


  constructor(
    private getCellStateService : GetCellStateService,
  ){}

  ngOnInit() {    
    this.getCellStateService.allImagesURI$.subscribe(data => {
      data.forEach(uri => {
        const completeURL = this.getCompleteUrl(uri);
        const imageInfo: ImageInfos = new ImageInfos(completeURL);
        this.imagesInfos.push(imageInfo);
        this.currentImage = this.imagesInfos[0];
      })
    });
  }


  /**
   * We add to the initial url the end of the url leading to the image 
   */
  getCompleteUrl(URI:string): string{
    let baseurl = `assets/images/lsc_thumbs512/thumbnails512/`;
    return baseurl+URI;
  }

  /**
   * Displays the view with the image clicked in the grid view. We will therefore hide the grid view, but also update the current image.
   */
  show_single_component(currentImage : ImageInfos){
    this.currentImage = currentImage;
    this.display_grid  = false;
    this.display_single = true;
  }

  /**
   * Displays the grid view.
   */
  show_grid_component(){
    this.display_grid  = true;
    this.display_single = false;
  }


  //Test Function
  test(){
    for(let i of [1,2,3,4,5,6]){
      const imageInfo: ImageInfos = new ImageInfos(`assets/images/test${i}.jpg`);
      this.imagesInfos.push(imageInfo);
    }
  }

}
