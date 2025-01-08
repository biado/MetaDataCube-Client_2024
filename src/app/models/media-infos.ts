import { SafeResourceUrl } from "@angular/platform-browser";

export class MediaInfos {
    file_uri: string|SafeResourceUrl;
    thumb_uri: string|SafeResourceUrl;
    isLoading : boolean;
    isError : boolean;

    mediaID : number;
    extension : string;

    constructor(file_uri : string|SafeResourceUrl,thumb_uri : string|SafeResourceUrl,mediaID : number,extension : string){
        this.file_uri = file_uri;
        this.thumb_uri = thumb_uri;
        this.isError = false;
        this.isLoading = true;

        this.mediaID = mediaID;
        this.extension = extension;
    }
}
