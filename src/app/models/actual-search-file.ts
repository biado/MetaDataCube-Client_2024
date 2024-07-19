import { Filter } from "./filter";
import { Hierarchy } from "./hierarchy";
import { SelectedDimensions } from "./selected-dimensions";
import { Tagset } from "./tagset";

export class ActualSearchFile {
    selectedDimensions : SelectedDimensions;
    selectedFilters : Filter[];
    preSelection : ((Hierarchy|Tagset)[])[];

    constructor(selectedDimensions : SelectedDimensions, selectedFilters : Filter[], preSelection : ((Hierarchy|Tagset)[])[]){
        this.selectedDimensions = selectedDimensions;
        this.selectedFilters = selectedFilters;
        this.preSelection = preSelection;
    }
}
