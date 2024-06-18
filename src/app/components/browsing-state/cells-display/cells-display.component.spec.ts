import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellsDisplayComponent } from './cells-display.component';

describe('CellsDisplayComponents', () => {
  let component: CellsDisplayComponent;
  let fixture: ComponentFixture<CellsDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CellsDisplayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CellsDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
