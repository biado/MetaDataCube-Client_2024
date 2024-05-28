import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DimensionsSelectionComponent } from './dimensions-selection.component';

describe('DimensionsSelectionComponent', () => {
  let component: DimensionsSelectionComponent;
  let fixture: ComponentFixture<DimensionsSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DimensionsSelectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DimensionsSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
