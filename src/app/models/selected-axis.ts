export class SelectedAxis {
    xid: number|undefined;
    xtype: 'node' | 'tagset' |undefined;

    yid: number|undefined;
    ytype: 'node' | 'tagset' |undefined;

    constructor(xid?:number, xtype?:'node' | 'tagset', yid?:number,ytype?:'node' | 'tagset'){
        this.xid = xid;
        this.xtype = xtype;
        this.yid = yid;
        this.ytype = ytype;
    }
}
