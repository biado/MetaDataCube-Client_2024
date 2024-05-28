export class Tag {    
    name: string;
    id: number;
    tagsetid : number;

    constructor(name: string, id: number,tagsetid : number ) {
        this.name = name;
        this.id = id;
        this.tagsetid = tagsetid;
    }
}
