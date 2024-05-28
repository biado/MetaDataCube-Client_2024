import { Node } from "./node";
export class Hierarchy {
    
    name: string;
    id: number;
    tagsetID: number;
    rootNodeID: number;
    firstNode: Node;

    constructor(name: string, id: number, tagsetID: number, rootNodeID: number, firstNode: Node) {
        this.name = name;
        this.id = id;
        this.tagsetID = tagsetID;
        this.rootNodeID = rootNodeID;
        this.firstNode = firstNode;
    }
}
