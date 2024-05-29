import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SelectedDimensionsService {
  // Information about the element chosen for the Y axis
  xname:string|null = null;
  xid:number|null = null;
  xtype:string|null = null;

  // To find out whether or not an X has already been selected
  ischeckedX:boolean = false;

  // Information about the element chosen for the Y axis
  yname:string|null = null;
  yid:number|null = null;
  ytype:string|null = null;


  // To find out whether or not an Y has already been selected
  ischeckedY:boolean = false;


  constructor() { }
}
