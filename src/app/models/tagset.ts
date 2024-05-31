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
    isVisibleDimensions : boolean;
    isVisibleFilters : boolean;
    isExpanded : boolean;


    constructor(name: string, id: number,hierarchies: Hierarchy[],tags:Tag[] ) {
        this.name = name;
        this.id = id;
        this.hierarchies = hierarchies;
        this.tags = tags

        this.isCheckedX = false;
        this.isCheckedY = false;
        this.isCheckedFilters = false;
        this.isVisibleDimensions = true;
        this.isVisibleFilters = true;
        this.isExpanded = false;

        this.type = 'tagset';
    }

}
