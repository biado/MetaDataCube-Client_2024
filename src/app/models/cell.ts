export class Cell {
    xCoordinate: number|undefined;
    yCoordinate: number|undefined;

    count: number;
    file_uri: string;

    constructor(count:number, file_uri : string, xCoordinate?: number, yCoordinate?: number) {
        this.count = count;
        this.file_uri = file_uri;
        if (xCoordinate !== undefined) {
            this.xCoordinate = xCoordinate;
        }
        if (yCoordinate !== undefined) {
            this.yCoordinate = yCoordinate;
        }
    }
}
