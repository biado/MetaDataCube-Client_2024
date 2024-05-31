import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltersSelectionTagComponent } from './filters-selection-tag.component';

describe('FiltersSelectionTagComponent', () => {
  let component: FiltersSelectionTagComponent;
  let fixture: ComponentFixture<FiltersSelectionTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FiltersSelectionTagComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FiltersSelectionTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
