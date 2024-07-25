import { Tag } from "./tag";

export class TagList {
    tags : Tag[];
    tagsetID : number;
    type : 'tagList';

    isVisible : boolean; 
    isExpanded : boolean;

    asRange : boolean;


    constructor(tags:Tag[], tagsetID : number) {
        this.tags = tags;
        this.tagsetID = tagsetID;
        this.type = 'tagList';
        
        this.isVisible = true;
        this.isExpanded = false;

        this.asRange = true;
    }
}
