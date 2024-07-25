import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionTagByRangeComponent } from './selection-tag-by-range.component';

describe('SelectionTagByRangeComponent', () => {
  let component: SelectionTagByRangeComponent;
  let fixture: ComponentFixture<SelectionTagByRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectionTagByRangeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectionTagByRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
