import { Filter } from "./filter";
import { SelectedDimensions } from "./selected-dimensions";

export class ActualSearchFile {
    selectedDimensions : SelectedDimensions;
    selectedFilters : Filter[];

    constructor(selectedDimensions : SelectedDimensions, selectedFilters : Filter[]){
        this.selectedDimensions = selectedDimensions;
        this.selectedFilters = selectedFilters;
    }
}
