import { Injectable } from '@angular/core';
import { SelectedDimensions } from '../models/selected-dimensions';
import { Filter } from '../models/filter';
import { SelectedDimensionsService } from './selected-dimensions.service';
import { SelectedFiltersService } from './selected-filters.service';

@Injectable({
  providedIn: 'root'
})
export class UndoRedoService {

  /** List of actions carried out. Shows whether a Dimension or Filter has been added at a given time. "Start" corresponds to the Initial state. */
  Do : ("Dim"|"Filter"|"Start")[] = ["Start"];

  /** List of the various SelectedDimensions that have been added. Provides a history of the various dimensions selected. */
  AllSelectedDimensionsDid : SelectedDimensions[] = [new SelectedDimensions()];

  /** List of List of filters that have been added. Provides a history of the various Filters selected. */
  AllFiltersAdd : (Filter[])[] =[[]];

  positionDo : number = 0;

  positionAllSelectedDimensionsDid : number = 0;

  positionAllFiltersAdd : number = 0;

  constructor( 
    private selectedDimensionsService : SelectedDimensionsService,
    private selectedFiltersService : SelectedFiltersService,
  ) 
  {}

  /**
   * Undo Function, two cases if you want to undo a Dimension or a Filter.
   */
  undo(){
    if(!(this.positionDo===0) && this.Do[this.positionDo]==="Dim"){
      this.undoDim();
    }    
    else if (!(this.positionDo===0) && this.Do[this.positionDo]==="Filter"){
      this.undoFilter();
    }
  }

  /**
   * To undo a dimension, we'll retrieve the previous SelectedDimensions from the AllSelectedDimensionsDid list. 
   * We'll then send it to selectedDimensionService to change it throughout the application. We'll also change the necessary positions.
   */
  undoDim(){
    const ActualX = this.AllSelectedDimensionsDid[this.positionAllSelectedDimensionsDid].elementX;
    const ActualY = this.AllSelectedDimensionsDid[this.positionAllSelectedDimensionsDid].elementY;
    if(ActualX?.type==="node" || ActualX?.type==="tagset"){
      ActualX.isCheckedX = false;
    }
    if(ActualY?.type==="node" || ActualY?.type==="tagset"){
      ActualY.isCheckedY = false;
    }

    this.positionAllSelectedDimensionsDid = this.positionAllSelectedDimensionsDid - 1;
    this.positionDo = this.positionDo - 1;
    const newSelectedDimensions = this.AllSelectedDimensionsDid[this.positionAllSelectedDimensionsDid];

    if(newSelectedDimensions.elementX?.type==="node" || newSelectedDimensions.elementX?.type==="tagset"){
      newSelectedDimensions.elementX.isCheckedX = true;
    }
    if(newSelectedDimensions.elementY?.type==="node" || newSelectedDimensions.elementY?.type==="tagset"){
      newSelectedDimensions.elementY.isCheckedY = true;
    }

    this.selectedDimensionsService.selectedDimensions.next(newSelectedDimensions);  
  }

  /**
   * To undo a filter, we'll retrieve the previous list of filters from the AllFiltersAdd filter list.
   * We'll then send it to selectedFiltersService to change it throughout the application. We'll also change the necessary positions.
   */
  undoFilter(){
    const ActualFilterList = this.AllFiltersAdd[this.positionAllFiltersAdd];
    ActualFilterList.forEach(filter=>{
      if(filter.element.type==="tag"){
        filter.element.ischecked = false;
      }
      else{
        filter.element.isCheckedFilters = false;
      }
    })

    this.positionAllFiltersAdd = this.positionAllFiltersAdd - 1;
    this.positionDo = this.positionDo - 1;

    // For filters, you need to recreate the lists every time (and not just do a list1 = list2), otherwise the objects are the same and there's no difference.
    let newListFilters : Filter[] = [];
    this.AllFiltersAdd[this.positionAllFiltersAdd].forEach(filter=>{
      newListFilters.push(filter);
    })

    newListFilters.forEach(filter=>{
      if(filter.element.type==="tag"){
        filter.element.ischecked = true;
      }
      else{
        filter.element.isCheckedFilters = true;
      }
    })

    this.selectedFiltersService.filtersSubject.next(newListFilters);    
  }

  /**
   * Redo Function, two cases if you want to redo a Dimension or a Filter.
   */
  redo(){
    if(!(this.positionDo===this.Do.length-1) && (this.Do[this.positionDo+1]==="Dim")){           
      this.redoDim();
    }
    else if (!(this.positionDo===this.Do.length-1) && (this.Do[this.positionDo+1]==="Filter")){          
      this.redoFilter();
    }
  }

  /**
   * To redo a dimension, we'll retrieve the next SelectedDimensions from the AllSelectedDimensionsDid list. 
   * We'll then send it to selectedDimensionService to change it throughout the application. We'll also change the necessary positions.
   */
  redoDim(){
    const ActualX = this.AllSelectedDimensionsDid[this.positionAllSelectedDimensionsDid].elementX;
    const ActualY = this.AllSelectedDimensionsDid[this.positionAllSelectedDimensionsDid].elementY;
    if(ActualX?.type==="node" || ActualX?.type==="tagset"){
      ActualX.isCheckedX = false;
    }
    if(ActualY?.type==="node" || ActualY?.type==="tagset"){
      ActualY.isCheckedY = false;
    }

    this.positionAllSelectedDimensionsDid = this.positionAllSelectedDimensionsDid + 1;
    this.positionDo = this.positionDo + 1;
    const newSelectedDimensions = this.AllSelectedDimensionsDid[this.positionAllSelectedDimensionsDid];

    if(newSelectedDimensions.elementX?.type==="node" || newSelectedDimensions.elementX?.type==="tagset"){
      newSelectedDimensions.elementX.isCheckedX = true;
    }
    if(newSelectedDimensions.elementY?.type==="node" || newSelectedDimensions.elementY?.type==="tagset"){
      newSelectedDimensions.elementY.isCheckedY = true;
    }

    this.selectedDimensionsService.selectedDimensions.next(newSelectedDimensions); 
  }

  /**
   * To redo a filter, we'll retrieve the next list of filters from the AllFiltersAdd filter list.
   * We'll then send it to selectedFiltersService to change it throughout the application. We'll also change the necessary positions.
   */
  redoFilter(){
    const ActualFilterList = this.AllFiltersAdd[this.positionAllFiltersAdd];
    ActualFilterList.forEach(filter=>{
      if(filter.element.type==="tag"){
        filter.element.ischecked = false;
      }
      else{
        filter.element.isCheckedFilters = false;
      }
    })
   
    this.positionAllFiltersAdd = this.positionAllFiltersAdd + 1;
    this.positionDo = this.positionDo + 1;
    const newListFilters = this.AllFiltersAdd[this.positionAllFiltersAdd];

    newListFilters.forEach(filter=>{
      if(filter.element.type==="tag"){
        filter.element.ischecked = true;
      }
      else{
        filter.element.isCheckedFilters = true;
      }
    })

    this.selectedFiltersService.filtersSubject.next(newListFilters);
  }

  /**
   * Function to add a filters list to the undo/redo list of filters list.
   * 
   * Each time, we'll recreate the list up to the position we're currently at (because if we add several actions after undo, it deletes all these undo actions).
   * Also enables to avoid copying the object address (and therefore having only one object). 
   * 
   * We'll add the "Filters" action to Do and increment the positions.
   */
  addFilterAction(filters:Filter[]){    
    let newDoList : ("Dim"|"Filter"|"Start")[] = [];
    for (let i = 0; i <= this.positionDo; i++) {
      newDoList.push(this.Do[i]);
    }
    this.Do = newDoList;

    let newAllFiltersAdd : (Filter[])[] = [];
    for (let i = 0; i <= this.positionAllFiltersAdd; i++) {
      const newfiltersList : Filter[]=[];
      this.AllFiltersAdd[i].forEach(filter=>{
        newfiltersList.push(filter)
      })
      newAllFiltersAdd.push(newfiltersList);
    }

    let newFiltersToAdd : Filter[] = []
    filters.forEach(filter=>{
      newFiltersToAdd.push(filter);
    })
    newAllFiltersAdd.push(newFiltersToAdd)

    this.Do.push("Filter");
    this.AllFiltersAdd = newAllFiltersAdd;

    this.positionAllFiltersAdd = this.positionAllFiltersAdd + 1;
    this.positionDo = this.positionDo + 1;
  }

  /**
   * Function to add a dimensions to the undo/redo dimensions list.
   * 
   * Each time, we'll recreate the list up to the position we're currently at (because if we add several actions after undo, it deletes all these undo actions).
   * Also enables to avoid copying the object address (and therefore having only one object). 
   * 
   * We'll add the "Dim" action to Do and increment the positions.
   */
  addDimensionsAction(selectedDimensions:SelectedDimensions){
    let newDoList : ("Dim"|"Filter"|"Start")[] = [];
    for (let i = 0; i <= this.positionDo; i++) {
      newDoList.push(this.Do[i]);
    }
    this.Do = newDoList;

    let newAllSelectedDimensionsDid : SelectedDimensions[] = [];
    for (let i = 0; i <= this.positionAllSelectedDimensionsDid; i++) {
      newAllSelectedDimensionsDid.push(this.AllSelectedDimensionsDid[i]);
    }
    this.AllSelectedDimensionsDid = newAllSelectedDimensionsDid;

    this.Do.push("Dim");
    this.AllSelectedDimensionsDid.push(selectedDimensions);
    this.positionAllSelectedDimensionsDid = this.positionAllSelectedDimensionsDid + 1;
    this.positionDo = this.positionDo + 1;
  }

}

