import { Injectable } from '@angular/core';
import { Filter } from '../models/filter';
import { Tag } from '../models/tag';
import { Tagset } from '../models/tagset';
import { GetTagsetListService } from './get-tagset-list.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SelectedFiltersService {
  /** filtersSubject is an observable subject, storing a list of Filter.  */
  private filtersSubject: BehaviorSubject<Filter[]> = new BehaviorSubject<Filter[]>([]);
  /** filters$ is a public observable, providing access to filtersSubject externally.  */
  filters$: Observable<Filter[]> = this.filtersSubject.asObservable();

  private tagsetlist: Tagset[] = [];

  constructor(
    private getTagsetListService: GetTagsetListService,
  ) {
    this.getTagsetListService.tagsetList$.subscribe(data => {
      this.tagsetlist = data;
    });
  }

  addFilter(id: number, type: 'tagset' | 'tag'): void {
    const filter = new Filter(id, type);
    const currentFilters = this.filtersSubject.value;
    this.filtersSubject.next([...currentFilters, filter]);
  }

  removeFilter(id: number, type: 'tagset' | 'tag'): void {
    let element: Filter | null = null;

    const currentFilters = this.filtersSubject.value;
    currentFilters.forEach(elt => {
      if (elt.type === type && elt.id === id) {
        element = elt;
      }
    });

    if (element !== null) {
      const updatedFilters = currentFilters.filter(f => f !== element);
      this.filtersSubject.next(updatedFilters);
    }
  }

  clearSelection(): void {
    console.log("\n ListFilters : ", this.filtersSubject.value);
    this.filtersSubject.value.forEach(elt => {
      this.uncheckElement(elt.id, elt.type);
    });
    this.filtersSubject.next([]);
  }

  uncheckElement(id: number, type: 'tagset' | 'tag'): void {
    let element: Tagset | Tag | null = null;

    for (const tagset of this.tagsetlist) {
      if (type === 'tagset') {
        if (tagset.id === id) {
          element = tagset;
          element.isCheckedFilters = false;
          break;
        }
      } else if (type === 'tag') {
        for (const tag of tagset.tags) {
          if (tag.id === id) {
            element = tag;
            element.ischecked = false;
            break;
          }
        }
      }
    }
  }

  getFiltersList(): Filter[] {
    return this.filtersSubject.value;
  }
}
