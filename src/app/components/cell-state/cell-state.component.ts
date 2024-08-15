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

  //Test Function, if launched, will add some image, audio and link to spotify and youtube to have some sample to play with
  test(){
    for(let i of [1,2,3,4,5,6]){
      const mediaInfo: MediaInfos = new MediaInfos(`assets/images/test${i}.jpg`,1,"jpg");
      this.mediasInfos.push(mediaInfo);
    }
    const mediaInfo: MediaInfos = new MediaInfos(`assets/images/audio_test.mp3`,1,"mp3");
    this.mediasInfos.push(mediaInfo);

    const sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://open.spotify.com/embed/track/0GWNtMohuYUEHVZ40tcnHF');
    const testSpotify: MediaInfos = new MediaInfos(sanitizedUrl,1,"spotify");
    this.mediasInfos.push(testSpotify);


    const sanitizedUrl2 = this.sanitizer.bypassSecurityTrustResourceUrl('https://open.spotify.com/embed/track/2O6X9nPVVQSefg3xOQAo5u');
    const testSpotify2: MediaInfos = new MediaInfos(sanitizedUrl2,1,"spotify");
    this.mediasInfos.push(testSpotify2);
    

    const sanitizedUrl3 = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/zQO7J483Dng?si=__Oqsv9QF4lUWKCz');
    const testYoutube: MediaInfos = new MediaInfos(sanitizedUrl3,1,"youtube");
    this.mediasInfos.push(testYoutube);
  }

}
