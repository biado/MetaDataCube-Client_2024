import { Injectable } from '@angular/core';
import { SelectedDimensions } from '../models/selected-dimensions';
import { Filter } from '../models/filter';
import { SelectedDimensionsService } from './selected-dimensions.service';
import { SelectedFiltersService } from './selected-filters.service';
import { ActualSearchFile } from '../models/actual-search-file';

@Injectable({
  providedIn: 'root'
})
export class UndoRedoService {

  /** List of actions carried out. Shows whether a Dimension, Filter or ActualSearchFile has been added at a given time. "Start" corresponds to the Initial state. */
  Do : ("Dim"|"Filter"|"File"|"Start")[] = ["Start"];

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
   * Undo Function, three cases if you want to undo a Dimension, a Filter or a ActualSearchFile.
   */
  undo(){
    if(!(this.positionDo===0) && this.Do[this.positionDo]==="Dim"){
      this.undoDim();
    }    
    else if (!(this.positionDo===0) && this.Do[this.positionDo]==="Filter"){
      this.undoFilter();
    }  
    else if (!(this.positionDo===0) && this.Do[this.positionDo]==="File"){
      this.undoFile();
    }
  }

  /**
   * To undo a dimension, we'll retrieve the previous SelectedDimensions from the AllSelectedDimensionsDid list. 
   * We'll then send it to selectedDimensionService to change it throughout the application. We'll also change the necessary positions.
   */
  undoDim(){
    //Get the actual SelectedDimensions and update the checkbox
    const ActualX = this.AllSelectedDimensionsDid[this.positionAllSelectedDimensionsDid].elementX;
    const ActualY = this.AllSelectedDimensionsDid[this.positionAllSelectedDimensionsDid].elementY;
    if(ActualX?.type==="node" || ActualX?.type==="tagset"){
      ActualX.isCheckedX = false;
    }
    if(ActualY?.type==="node" || ActualY?.type==="tagset"){
      ActualY.isCheckedY = false;
    }

    //Modify position and get previous element
    this.positionAllSelectedDimensionsDid = this.positionAllSelectedDimensionsDid - 1;
    this.positionDo = this.positionDo - 1;
    const newSelectedDimensions = this.AllSelectedDimensionsDid[this.positionAllSelectedDimensionsDid];

    //Update the checkbox of the previous element
    if(newSelectedDimensions.elementX?.type==="node" || newSelectedDimensions.elementX?.type==="tagset"){
      newSelectedDimensions.elementX.isCheckedX = true;
    }
    if(newSelectedDimensions.elementY?.type==="node" || newSelectedDimensions.elementY?.type==="tagset"){
      newSelectedDimensions.elementY.isCheckedY = true;
    }

    //Update in the corresponding service
    this.selectedDimensionsService.selectedDimensions.next(newSelectedDimensions);  
  }

  /**
   * To undo a filter, we'll retrieve the previous list of filters from the AllFiltersAdd filter list.
   * We'll then send it to selectedFiltersService to change it throughout the application. We'll also change the necessary positions.
   */
  undoFilter(){
    //Get the actual FilterList and update the checkbox
    const ActualFilterList = this.AllFiltersAdd[this.positionAllFiltersAdd];
    ActualFilterList.forEach(filter=>{
      if(filter.element.type==="tag"){
        filter.element.ischecked = false;
      }
      else{
        filter.element.isCheckedFilters = false;
      }
    })

    //Modify position to get previous element
    this.positionAllFiltersAdd = this.positionAllFiltersAdd - 1;
    this.positionDo = this.positionDo - 1;

    // Get previous FilterList : for filters, you need to recreate the lists every time (and not just do a list1 = list2), otherwise the objects are the same and there's no difference.
    let newListFilters : Filter[] = [];
    this.AllFiltersAdd[this.positionAllFiltersAdd].forEach(filter=>{
      newListFilters.push(filter);
    })

    //Update the checkbox of the previous filters
    newListFilters.forEach(filter=>{
      if(filter.element.type==="tag"){
        filter.element.ischecked = true;
      }
      else{
        filter.element.isCheckedFilters = true;
      }
    })

    //Update in the corresponding service
    this.selectedFiltersService.filtersSubject.next(newListFilters);    
  }

  /**
   * To undo a ActualSearchFile, we'll retrieve  the previous SelectedDimensions from the AllSelectedDimensionsDid list
   * and the previous list of filters from the AllFiltersAdd filter list . 
   * We'll then send them to selectedDimensionService and selectedFiltersService to change it throughout the application. We'll also change the necessary positions.
   */
  undoFile(){
    //Get the actual SelectedDimensions and update the checkbox
    const ActualX = this.AllSelectedDimensionsDid[this.positionAllSelectedDimensionsDid].elementX;
    const ActualY = this.AllSelectedDimensionsDid[this.positionAllSelectedDimensionsDid].elementY;
    if(ActualX?.type==="node" || ActualX?.type==="tagset"){
      ActualX.isCheckedX = false;
    }
    if(ActualY?.type==="node" || ActualY?.type==="tagset"){
      ActualY.isCheckedY = false;
    }

    //Get the actual FilterList and update the checkbox
    const ActualFilterList = this.AllFiltersAdd[this.positionAllFiltersAdd];
    ActualFilterList.forEach(filter=>{
      if(filter.element.type==="tag"){
        filter.element.ischecked = false;
      }
      else{
        filter.element.isCheckedFilters = false;
      }
    })

    //Modify position to get previous element
    this.positionAllSelectedDimensionsDid = this.positionAllSelectedDimensionsDid - 1;
    this.positionAllFiltersAdd = this.positionAllFiltersAdd - 1; 
    this.positionDo = this.positionDo - 1;
    
    //Get previous SelectedDimensions
    const newSelectedDimensions = this.AllSelectedDimensionsDid[this.positionAllSelectedDimensionsDid];

    //Get previous FilterList
    let newListFilters : Filter[] = [];
    this.AllFiltersAdd[this.positionAllFiltersAdd].forEach(filter=>{
      newListFilters.push(filter);
    })
    
    //Update the checkbox of the previous element
    if(newSelectedDimensions.elementX?.type==="node" || newSelectedDimensions.elementX?.type==="tagset"){
      newSelectedDimensions.elementX.isCheckedX = true;
    }
    if(newSelectedDimensions.elementY?.type==="node" || newSelectedDimensions.elementY?.type==="tagset"){
      newSelectedDimensions.elementY.isCheckedY = true;
    }

    //Update the checkbox of the previous Filter
    newListFilters.forEach(filter=>{
      if(filter.element.type==="tag"){
        filter.element.ischecked = true;
      }
      else{
        filter.element.isCheckedFilters = true;
      }
    })

    //Change FilterLsit and SelectedDimensions in the corresponding service
    this.selectedFiltersService.filtersSubject.next(newListFilters);    
    this.selectedDimensionsService.selectedDimensions.next(newSelectedDimensions);  
  }

  /**
   * Redo Function, three cases if you want to redo a Dimension, a Filter or a ActualSearchFile.
   */
  redo(){
    if(!(this.positionDo===this.Do.length-1) && (this.Do[this.positionDo+1]==="Dim")){           
      this.redoDim();
    }
    else if (!(this.positionDo===this.Do.length-1) && (this.Do[this.positionDo+1]==="Filter")){          
      this.redoFilter();
    }
    else if (!(this.positionDo===this.Do.length-1) && (this.Do[this.positionDo+1]==="File")){          
      this.redoFile();
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
   * To undo a ActualSearchFile, we'll retrieve  the next SelectedDimensions from the AllSelectedDimensionsDid list
   * and the next list of filters from the AllFiltersAdd filter list . 
   * We'll then send them to selectedDimensionService and selectedFiltersService to change it throughout the application. We'll also change the necessary positions.
   */
  redoFile(){
    const ActualX = this.AllSelectedDimensionsDid[this.positionAllSelectedDimensionsDid].elementX;
    const ActualY = this.AllSelectedDimensionsDid[this.positionAllSelectedDimensionsDid].elementY;
    if(ActualX?.type==="node" || ActualX?.type==="tagset"){
      ActualX.isCheckedX = false;
    }
    if(ActualY?.type==="node" || ActualY?.type==="tagset"){
      ActualY.isCheckedY = false;
    }

    const ActualFilterList = this.AllFiltersAdd[this.positionAllFiltersAdd];
    ActualFilterList.forEach(filter=>{
      if(filter.element.type==="tag"){
        filter.element.ischecked = false;
      }
      else{
        filter.element.isCheckedFilters = false;
      }
    })

    this.positionAllSelectedDimensionsDid = this.positionAllSelectedDimensionsDid + 1;
    this.positionAllFiltersAdd = this.positionAllFiltersAdd + 1;
    this.positionDo = this.positionDo + 1;

    const newSelectedDimensions = this.AllSelectedDimensionsDid[this.positionAllSelectedDimensionsDid];
    const newListFilters = this.AllFiltersAdd[this.positionAllFiltersAdd];
    
    if(newSelectedDimensions.elementX?.type==="node" || newSelectedDimensions.elementX?.type==="tagset"){
      newSelectedDimensions.elementX.isCheckedX = true;
    }
    if(newSelectedDimensions.elementY?.type==="node" || newSelectedDimensions.elementY?.type==="tagset"){
      newSelectedDimensions.elementY.isCheckedY = true;
    }

    newListFilters.forEach(filter=>{
      if(filter.element.type==="tag"){
        filter.element.ischecked = true;
      }
      else{
        filter.element.isCheckedFilters = true;
      }
    })

    this.selectedDimensionsService.selectedDimensions.next(newSelectedDimensions); 
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
    //Delete the DoList Element after the actual position if they exist
    let newDoList : ("Dim"|"Filter"|"File"|"Start")[] = [];
    for (let i = 0; i <= this.positionDo; i++) {
      newDoList.push(this.Do[i]);
    }
    this.Do = newDoList;

    //Delete the Filters List after the actual position if they exist
    let newAllFiltersAdd : (Filter[])[] = [];
    for (let i = 0; i <= this.positionAllFiltersAdd; i++) {
      const newfiltersList : Filter[]=[];
      this.AllFiltersAdd[i].forEach(filter=>{
        newfiltersList.push(filter)
      })
      newAllFiltersAdd.push(newfiltersList);
    }

    //Add the new filters List to the List of filters List
    let newFiltersToAdd : Filter[] = []
    filters.forEach(filter=>{
      newFiltersToAdd.push(filter);
    })
    newAllFiltersAdd.push(newFiltersToAdd)
    this.AllFiltersAdd = newAllFiltersAdd;

    //Add the name of the element added to the Do List
    this.Do.push("Filter");

    //Increment position
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
    //Delete the DoList Element after the actual position if they exist
    let newDoList : ("Dim"|"Filter"|"File"|"Start")[] = [];
    for (let i = 0; i <= this.positionDo; i++) {
      newDoList.push(this.Do[i]);
    }
    this.Do = newDoList;

    //Delete the SelectedDimensions element after the actual position if they exist
    let newAllSelectedDimensionsDid : SelectedDimensions[] = [];
    for (let i = 0; i <= this.positionAllSelectedDimensionsDid; i++) {
      newAllSelectedDimensionsDid.push(this.AllSelectedDimensionsDid[i]);
    }
    this.AllSelectedDimensionsDid = newAllSelectedDimensionsDid;

    //Add the new SelectedDimensions to the list of SelectedDimensions
    this.AllSelectedDimensionsDid.push(selectedDimensions);

    //Add the name of the element added to the Do List
    this.Do.push("Dim");

    //Increment position
    this.positionAllSelectedDimensionsDid = this.positionAllSelectedDimensionsDid + 1;
    this.positionDo = this.positionDo + 1;
  }

  /**
   * Function to add a ActualSearchFile to the undo/redo.
   * 
   * It add at the same time a selectedDimensions and a filter. (it use the same method as the two other add methode but we only increment one time this.positionDo)
   * 
   * We'll add the "File" action to Do and increment all the positions with 1.
   */
  addFileAction(actualSearchFile:ActualSearchFile){
    let newDoList : ("Dim"|"Filter"|"File"|"Start")[] = [];
    for (let i = 0; i <= this.positionDo; i++) {
      newDoList.push(this.Do[i]);
    }
    this.Do = newDoList;

    let newAllSelectedDimensionsDid : SelectedDimensions[] = [];
    for (let i = 0; i <= this.positionAllSelectedDimensionsDid; i++) {
      newAllSelectedDimensionsDid.push(this.AllSelectedDimensionsDid[i]);
    }
    this.AllSelectedDimensionsDid = newAllSelectedDimensionsDid;

    let newAllFiltersAdd : (Filter[])[] = [];
    for (let i = 0; i <= this.positionAllFiltersAdd; i++) {
      const newfiltersList : Filter[]=[];
      this.AllFiltersAdd[i].forEach(filter=>{
        newfiltersList.push(filter)
      })
      newAllFiltersAdd.push(newfiltersList);
    }

    let newFiltersToAdd : Filter[] = []
    actualSearchFile.selectedFilters.forEach(filter=>{
      newFiltersToAdd.push(filter);
    })
    newAllFiltersAdd.push(newFiltersToAdd)
    this.AllFiltersAdd = newAllFiltersAdd;

    this.AllSelectedDimensionsDid.push(actualSearchFile.selectedDimensions);

    this.Do.push("File");

    this.positionAllSelectedDimensionsDid = this.positionAllSelectedDimensionsDid + 1;
    this.positionAllFiltersAdd = this.positionAllFiltersAdd + 1;
    this.positionDo = this.positionDo + 1;
  }

}

