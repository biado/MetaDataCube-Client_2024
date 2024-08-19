import { Component, EventEmitter, HostListener, Inject, Input, Output, PLATFORM_ID } from '@angular/core';
import { MediaInfos } from '../../../models/media-infos';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cell-state-single',
  templateUrl: './cell-state-single.component.html',
  styleUrl: './cell-state-single.component.css'
})
export class CellStateSingleComponent {
  @Input() mediaInfos: MediaInfos[] = [];
  @Input() currentMedia: MediaInfos = this.mediaInfos[0];
  
  @Output() change_current_media = new EventEmitter<MediaInfos>();  

  display_media_tags_list : boolean = false;

  currentMediaTags: { tagset: string; tags: string[] }[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(){
    this.getMediaTagList();
  }
  
  /** 
   * Function launched when an image is correctly loaded. We'll then set the isLoading and isError on true of the corresponding image 
   * 
   * Depending on whether the image is in portrait or landscape mode, we'll modify the variables to obtain an optimal display.
   */
  onLoad(img: MediaInfos, event: Event) {
    img.isLoading = false;
    img.isError = false;

    const imgElement = event.target as HTMLImageElement;
    const imgWidth = imgElement.naturalWidth;
    const imgHeight = imgElement.naturalHeight;

    if (imgWidth > imgHeight) {
        imgElement.style.width = '100%';
        imgElement.style.height = 'auto';   
    } else {
      imgElement.style.width = 'auto';
      imgElement.style.height = '100%';
    }
  }

  /** Function launched when there's an error loading the media. We'll then set the isLoading to False and isError on true of the corresponding media */
  onError(media: MediaInfos) {
    media.isLoading = false;
    media.isError = true;
  }

  /** Function to display the previous media in the list (if not already at the beginning). We'll also notify cell-state.component of the current media change. */
  previousMedia(){
    const index = this.mediaInfos.indexOf(this.currentMedia);
    if(index>0){
      this.currentMedia = this.mediaInfos[index-1];
      this.change_current_media.emit(this.currentMedia);
      this.getMediaTagList();
    }
  }

  /** Function to display the next media in the list (if not already at the end). We'll also notify cell-state.component of the current media change. */
  nextMedia(){
    const index = this.mediaInfos.indexOf(this.currentMedia);
    console.log(index,"/",this.mediaInfos.length)
    if(!(index===-1) && index<this.mediaInfos.length-1){
      this.currentMedia = this.mediaInfos[index+1];
      this.change_current_media.emit(this.currentMedia);
      this.getMediaTagList();
    }
  }

  /**
   * Function to update the list of tags corresponding to those applied to the current media.
   */
  getMediaTagList() {
      this.http.get(`api/cubeobject/${this.currentMedia.mediaID}/tags`).toPromise()
        .then((response: any) => {
          let currentImageTags: { tagset: string; tags: string[] }[] = [];

          response.forEach((item: any) => {
            let tagsetObj = currentImageTags.find(t => t.tagset === item.tagsetName);

            if (!tagsetObj) {
              tagsetObj = { tagset: item.tagsetName, tags: [] };
              currentImageTags.push(tagsetObj);
            }

            tagsetObj.tags.push(item.name);
          });

          this.currentMediaTags = currentImageTags;
          
        });
  }

}
