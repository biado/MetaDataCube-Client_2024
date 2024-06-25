import { Injectable } from '@angular/core';
import { Filter } from '../models/filter';
import { Tag } from '../models/tag';
import { Tagset } from '../models/tagset';
import { GetTagsetListService } from './get-tagset-list.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { UndoRedoService } from './undo-redo.service';

@Injectable({
  providedIn: 'root'
})
export class SelectedFiltersService {
  /** filtersSubject is an observable subject, storing a list of Filter.  */
  filtersSubject: BehaviorSubject<Filter[]> = new BehaviorSubject<Filter[]>([]);
  /** filters$ is a public observable, providing access to filtersSubject externally.  */
  filters$: Observable<Filter[]> = this.filtersSubject.asObservable();
}
