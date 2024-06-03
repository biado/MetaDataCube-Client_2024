export class Filter {
    id: number;
    type:'tagset'|'tag';

    constructor(id: number,type : 'tagset'|'tag' ) {
        this.id = id;
        this.type = type;
    }

}
