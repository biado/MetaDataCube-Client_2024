export class Cell {
    xCoordinate: number|undefined;
    yCoordinate: number|undefined;

    count: number;
    img_url: string;

    constructor(count:number, img_url : string, xCoordinate?: number, yCoordinate?: number) {
        this.count = count;
        this.img_url = img_url;
        if (xCoordinate !== undefined) {
            this.xCoordinate = xCoordinate;
        }
        if (yCoordinate !== undefined) {
            this.yCoordinate = yCoordinate;
        }
    }
}
