import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SelectedAxis } from '../models/selected-axis';

@Injectable({
  providedIn: 'root'
})
export class SelectedDimensionsService {

  selectedAxis: BehaviorSubject<SelectedAxis> = new BehaviorSubject<SelectedAxis>(new SelectedAxis());
  selectedAxis$: Observable<SelectedAxis> = this.selectedAxis.asObservable();

  
  xname:string|null = null;  
  // To find out whether or not an X has already been selected
  ischeckedX:boolean = false;


  yname:string|null = null;
  // To find out whether or not an Y has already been selected
  ischeckedY:boolean = false;


  constructor() { }
}
