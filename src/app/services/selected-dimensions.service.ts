import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SelectedDimensionsService {
  // Information about the element chosen for the Y axis
  xname:string|null = null;

  xid: BehaviorSubject<number|null> = new BehaviorSubject<number|null>(null);
  xid$: Observable<number|null> = this.xid.asObservable();

  xtype: BehaviorSubject<'node' | 'tagset' |null> = new BehaviorSubject<'node' | 'tagset' |null>(null);
  xtype$: Observable<'node' | 'tagset' |null> = this.xtype.asObservable();
  
  // To find out whether or not an X has already been selected
  ischeckedX:boolean = false;


  // Information about the element chosen for the Y axis
  yname:string|null = null;

  yid: BehaviorSubject<number|null> = new BehaviorSubject<number|null>(null);
  yid$: Observable<number|null> = this.yid.asObservable();

  ytype: BehaviorSubject<'node' | 'tagset' |null> = new BehaviorSubject<'node' | 'tagset' |null>(null);
  ytype$: Observable<'node' | 'tagset' |null> = this.ytype.asObservable();

  // To find out whether or not an Y has already been selected
  ischeckedY:boolean = false;


  constructor() { }
}
