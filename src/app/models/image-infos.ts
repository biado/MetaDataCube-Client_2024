export class ImageInfos {
    uri: string;
    isLoading : boolean;
    isError : boolean;

    constructor(uri : string){
        this.uri = uri;
        this.isError = false;
        this.isLoading = true;
    }
}
