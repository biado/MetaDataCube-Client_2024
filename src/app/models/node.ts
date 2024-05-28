export class Node {
    name: string;
    id: number;
    parentID: number | null;
    children: Node[] | null;

    constructor(name: string, id: number, parents: number | null = null, children: Node[] | null = null) {
        this.name = name;
        this.id = id;
        this.parentID = parents;
        this.children = children;
    }
}
