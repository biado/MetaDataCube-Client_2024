import { Tag } from "./tag";
import { Tagset } from "./tagset";
import { Node } from "./node";

export class Filter {
    id: number;
    type:'tagset'|'tag'|'node';
    element : Tag | Tagset | Node;

    constructor(id: number,type : 'tagset'|'tag'|'node',element:Tag|Tagset|Node ) {
        this.id = id;
        this.type = type;
        this.element = element;
    }

}
