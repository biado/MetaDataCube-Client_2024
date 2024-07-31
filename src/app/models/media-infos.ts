import e from "express";

export class MediaInfos {
    uri: string;
    isLoading : boolean;
    isError : boolean;

    mediaID : number;
    extension : string;

    songName : string | undefined;
    artistName : string | undefined;

    constructor(uri : string,mediaID : number,extension : string){
        this.uri = uri;
        this.isError = false;
        this.isLoading = true;

        this.mediaID = mediaID;
        this.extension = extension;
    }
}
