import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SelectedCellState } from '../models/selected-cell-state';

@Injectable({
  providedIn: 'root'
})
export class SelectedCellStateService {

  selectedCellState: BehaviorSubject<SelectedCellState> = new BehaviorSubject<SelectedCellState>(new SelectedCellState());
  /** Dimensions of the cell from which you want to see all the images. 
   * 
   * Different from the selectedDImensionsService SelectedDimensions (We don't want them to be the same for when we returns to browsing State Page 
   * we're the same display as before having clicked on an image.)*/
  selectedCellState$: Observable<SelectedCellState> = this.selectedCellState.asObservable();

  constructor() { }
}
