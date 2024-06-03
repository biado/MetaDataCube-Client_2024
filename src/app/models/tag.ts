export class Tag {    
    name: string;
    id: number;
    tagsetid : number;
    type:'tag';

    ischecked : boolean;
    isVisible : boolean;

    constructor(name: string, id: number,tagsetid : number ) {
        this.name = name;
        this.id = id;
        this.tagsetid = tagsetid;

        this.ischecked=false;
        this.isVisible=true;

        this.type = 'tag';
    }
}
