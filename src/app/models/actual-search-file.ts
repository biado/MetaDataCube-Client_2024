import { Filter } from "./filter";
import { Hierarchy } from "./hierarchy";
import { SelectedDimensions } from "./selected-dimensions";
import { TagList } from "./tag-list";
import { Tagset } from "./tagset";

export class ActualSearchFile {
    selectedDimensions : SelectedDimensions;
    selectedFilters : Filter[];
    configuration : (({element : Hierarchy|Tagset|TagList, configurationType:'isVisible'|'asRange'})[])[];

    constructor(selectedDimensions : SelectedDimensions, selectedFilters : Filter[], configuration : (({element : Hierarchy|Tagset|TagList, configurationType:'isVisible'|'asRange'})[])[]){
        this.selectedDimensions = selectedDimensions;
        this.selectedFilters = selectedFilters;
        this.configuration = configuration;
    }
}
