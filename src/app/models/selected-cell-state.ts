export class SelectedCellState {
    xid: number|undefined;
    xtype: 'node' | 'tagset' | 'tag' |undefined;      

    yid: number|undefined;
    ytype: 'node' | 'tagset' | 'tag' |undefined;   

    url : string;   

    constructor(xid?:number, xtype?:'node' | 'tagset' | 'tag', yid?:number, ytype?:'node' | 'tagset' | 'tag'){
        this.xid = xid;
        this.xtype = xtype;

        this.yid = yid;
        this.ytype = ytype;

        this.url = "";

    }
}
