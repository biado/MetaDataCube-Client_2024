export class Node {
    name: string;
    id: number;
    type:'node';
    parentID: number | null;
    tagsetID : number;
    children: Node[] | null;
    tagId : number;

    isExpandedDimensions : boolean;
    isExpandedFilters : boolean;
    isCheckedX : boolean; 
    isCheckedY : boolean; 
    isCheckedFilters:boolean;
    isVisibleDimensions : boolean;
    isVisibleFilters : boolean;

    constructor(name: string, id: number, parents: number | null = null, children: Node[] | null = null, tagID:number, tagsetID : number) {
        this.name = name;
        this.id = id;
        this.parentID = parents;
        this.tagsetID = tagsetID;
        this.children = children;
        this.tagId = tagID;

        this.isExpandedDimensions = false;
        this.isExpandedFilters = false;
        this.isCheckedX = false;
        this.isCheckedY = false;
        this.isCheckedFilters = false;
        this.isVisibleDimensions = true;
        this.isVisibleFilters = true;
        
        this.type = 'node';
    }
}
