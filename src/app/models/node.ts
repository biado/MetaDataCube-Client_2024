export class Node {
    name: string;
    id: number;
    type:'node';
    parentID: number | null;
    children: Node[] | null;
    tagId : number;

    isExpanded : boolean; 
    isCheckedX : boolean; 
    isCheckedY : boolean; 
    isCheckedFilters:boolean;
    isVisibleDimensions : boolean;
    isVisibleFilters : boolean;

    constructor(name: string, id: number, parents: number | null = null, children: Node[] | null = null, tagID:number) {
        this.name = name;
        this.id = id;
        this.parentID = parents;
        this.children = children;
        this.tagId = tagID;

        this.isExpanded = false;
        this.isCheckedX = false;
        this.isCheckedY = false;
        this.isCheckedFilters = false;
        this.isVisibleDimensions = true;
        this.isVisibleFilters = true;
        
        this.type = 'node';
    }
}
