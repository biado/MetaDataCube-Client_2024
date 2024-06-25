import { Tag } from "./tag";
import { Tagset } from "./tagset";
import { Node } from "./node";

export class SelectedDimensions {
    xname:string|undefined;    
    xid: number|undefined;
    xtype: 'node' | 'tagset' | 'tag' |undefined;        
    ischeckedX:boolean;                         // To find out whether or not an X has already been selected
    elementX : Tag | Tagset | Node | undefined;

    yname:string|undefined;
    yid: number|undefined;
    ytype: 'node' | 'tagset' | 'tag' |undefined;   
    ischeckedY:boolean;                         // To find out whether or not an Y has already been selected
    elementY : Tag | Tagset | Node | undefined;

    url : string;   

    constructor(xname?:string,xid?:number, xtype?:'node' | 'tagset' | 'tag', elementX? : Tag | Tagset | Node , yname?:string,yid?:number, ytype?:'node' | 'tagset' | 'tag', elementY? : Tag | Tagset | Node){
        this.xname = xname;
        this.xid = xid;
        this.xtype = xtype;
        this.ischeckedX = false;
        this.elementX = elementX;

        this.yname = yname;
        this.yid = yid;
        this.ytype = ytype;
        this.ischeckedY = false;
        this.elementY = elementY;

        this.url = "";

    }
}
