import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DimensionsSelectionNodeComponent } from './dimensions-selection-node.component';

describe('DimensionsSelectionNodeComponent', () => {
  let component: DimensionsSelectionNodeComponent;
  let fixture: ComponentFixture<DimensionsSelectionNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DimensionsSelectionNodeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DimensionsSelectionNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
