import { Tag } from "./tag";
import { Tagset } from "./tagset";

export class Filter {
    id: number;
    type:'tagset'|'tag';
    element : Tag | Tagset;

    constructor(id: number,type : 'tagset'|'tag',element:Tag|Tagset ) {
        this.id = id;
        this.type = type;
        this.element = element;
    }

}
