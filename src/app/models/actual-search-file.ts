import { Filter } from "./filter";
import { Hierarchy } from "./hierarchy";
import { SelectedDimensions } from "./selected-dimensions";
import { TagList } from "./tag-list";
import { Tagset } from "./tagset";

export class ActualSearchFile {
    selectedDimensions : SelectedDimensions;
    selectedFilters : Filter[];
    preSelection : (({element : Hierarchy|Tagset|TagList, preselectionType:'isVisible'|'asRange'})[])[];

    constructor(selectedDimensions : SelectedDimensions, selectedFilters : Filter[], preSelection : (({element : Hierarchy|Tagset|TagList, preselectionType:'isVisible'|'asRange'})[])[]){
        this.selectedDimensions = selectedDimensions;
        this.selectedFilters = selectedFilters;
        this.preSelection = preSelection;
    }
}
