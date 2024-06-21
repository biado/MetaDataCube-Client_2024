import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellStateGridComponent } from './cell-state-grid.component';

describe('CellStateGridComponent', () => {
  let component: CellStateGridComponent;
  let fixture: ComponentFixture<CellStateGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CellStateGridComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CellStateGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
