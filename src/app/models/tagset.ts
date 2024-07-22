import { Hierarchy } from "./hierarchy";
import { Tag } from "./tag";

export class Tagset {
    name: string;
    id: number;
    type:'tagset';
    hierarchies: Hierarchy[];
    tags : Tag[];
    isCheckedX:boolean;
    isCheckedY:boolean;
    isCheckedFilters:boolean;
    isVisible : boolean;
    isExpanded : boolean;

    // Variable to show/expand or not the list of tag contain in the tagset
    isTagListVisible : boolean; 
    isTagListExpanded : boolean;


    constructor(name: string, id: number,hierarchies: Hierarchy[],tags:Tag[] ) {
        this.name = name;
        this.id = id;
        this.hierarchies = hierarchies;
        this.tags = tags

        this.isCheckedX = false;
        this.isCheckedY = false;
        this.isCheckedFilters = false;
        this.isVisible = true;
        this.isExpanded = false;

        this.isTagListVisible = true;
        this.isTagListExpanded = false;

        this.type = 'tagset';
    }

}
