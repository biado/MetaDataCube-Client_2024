import { Component } from '@angular/core';
import { GetCellStateService } from '../../services/get-cell-state.service';
import { MediaInfos } from '../../models/media-infos';
import { Router } from '@angular/router';
import { DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-cell-state',
  templateUrl: './cell-state.component.html',
  styleUrl: './cell-state.component.css'
})
export class CellStateComponent {

  mediasInfos: MediaInfos[] = [];
  /** Image selected in the grid. The image is kept in memory even when you return to the grid, so as not to lose it when you change view. */
  currentMedia: MediaInfos = new MediaInfos("",0,"");     

  display_grid : boolean = true;
  display_single : boolean = false;

  constructor(
    private getCellStateService : GetCellStateService,
    private router: Router,
    private sanitizer: DomSanitizer 
  ){}

  ngOnInit() {    
    this.getCellStateService.allMediasInfos$.subscribe(data => {
      data.forEach(mediaInfos => {

        /**
         * Complete URL because in the database is juste the name of the file, so we need to add the path
         * 
         * The aim is to have the complete link in the database! Here's a problem with the LSC22 database
         */
        const completeURL = `assets/images/lsc_thumbs512/thumbnails512/`+ mediaInfos.file_uri;
        
        let imageInfo: MediaInfos;
        
        // Handle special cases for YouTube and Spotify where we sanitized the url
        if (['youtube', 'spotify'].includes(mediaInfos.extension.toLowerCase())) {
          const sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(mediaInfos.file_uri.toString());
          imageInfo = new MediaInfos(sanitizedUrl, mediaInfos.mediaID, mediaInfos.extension);
        } else {
          imageInfo = new MediaInfos(completeURL, mediaInfos.mediaID, mediaInfos.extension);
        }

        this.mediasInfos.push(imageInfo);
        this.currentMedia = this.mediasInfos[0];
      });
    });
  }

  /**
   * Displays the view with the image clicked in the grid view. We will therefore hide the grid view, but also update the current image.
   */
  show_single_component(currentMedia : MediaInfos){
    this.currentMedia = currentMedia;
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

  /**
   * Change variables to display the browsing-state Page
   */
  go_to_browsingState_Page():void{
    this.router.navigate(['/browsing-state']);
  }
}
