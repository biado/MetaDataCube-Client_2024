export class Node {
    name: string;
    id: number;
    type:'node';
    parentID: number | null;
    children: Node[] | null;

    isExpanded : boolean; 
    isCheckedX : boolean; 
    isCheckedY : boolean; 
    isVisible : boolean; 

    constructor(name: string, id: number, parents: number | null = null, children: Node[] | null = null) {
        this.name = name;
        this.id = id;
        this.parentID = parents;
        this.children = children;

        this.isExpanded = false;
        this.isCheckedX = false;
        this.isCheckedY = false;
        this.isVisible = true;
        
        this.type = 'node';
    }
}
