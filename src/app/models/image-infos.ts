export class ImageInfos {
    uri: string;
    isLoading : boolean;
    isError : boolean;

    mediaID : number;

    constructor(uri : string,mediaID : number){
        this.uri = uri;
        this.isError = false;
        this.isLoading = true;

        this.mediaID = mediaID;
    }
}
