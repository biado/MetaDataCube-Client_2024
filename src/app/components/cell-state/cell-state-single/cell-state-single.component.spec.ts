import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellStateSingleComponent } from './cell-state-single.component';

describe('CellStateSingleComponent', () => {
  let component: CellStateSingleComponent;
  let fixture: ComponentFixture<CellStateSingleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CellStateSingleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CellStateSingleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
