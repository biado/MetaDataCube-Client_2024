import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SelectedDimensions } from '../models/selected-dimensions';

@Injectable({
  providedIn: 'root'
})
export class SelectedDimensionsService {

  selectedDimensions: BehaviorSubject<SelectedDimensions> = new BehaviorSubject<SelectedDimensions>(new SelectedDimensions());
  selectedDimensions$: Observable<SelectedDimensions> = this.selectedDimensions.asObservable();


  constructor() { }
}
