import { Hierarchy } from "./hierarchy";
import { Tag } from "./tag";

export class Tagset {
    name: string;
    id: number;
    hierarchies: Hierarchy[];
    tags : Tag[]

    constructor(name: string, id: number,hierarchies: Hierarchy[],tags:Tag[] ) {
        this.name = name;
        this.id = id;
        this.hierarchies = hierarchies;
        this.tags = tags
    }
}
