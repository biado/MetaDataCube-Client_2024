import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellStateComponent } from './cell-state.component';

describe('GridComponent', () => {
  let component: CellStateComponent;
  let fixture: ComponentFixture<CellStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CellStateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CellStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
