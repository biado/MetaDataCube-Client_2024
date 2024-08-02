import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MediaInfos } from '../../../models/media-infos';

@Component({
  selector: 'app-cell-state-grid',
  templateUrl: './cell-state-grid.component.html',
  styleUrl: './cell-state-grid.component.css'
})
export class CellStateGridComponent {

  @Input() mediaInfos: MediaInfos[] = [];
  
  @Output() show_single = new EventEmitter<MediaInfos>();

  /** Function launched when an image is correctly loaded. We'll then set the isLoading and isError on false of the corresponding image */
  onLoad(media: MediaInfos) {
    media.isLoading = false;
    media.isError = false;
  }

  /** Function launched when there's an error loading the image. We'll then set the isLoading to False and isError on true of the corresponding image */
  onError(media: MediaInfos) {
    media.isLoading = false;
    media.isError = true;
  }

  /** When you click on an image in the grid, the view changes to show that image and only that image. As a result, you will also be warned of the selection of a current image. */
  zoom_on_media(media : MediaInfos){
    this.show_single.emit(media);
  }


}
