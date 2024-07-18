import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltersSelectionNodesComponent } from './filters-selection-nodes.component';

describe('FiltersSelectionNodesComponent', () => {
  let component: FiltersSelectionNodesComponent;
  let fixture: ComponentFixture<FiltersSelectionNodesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FiltersSelectionNodesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FiltersSelectionNodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
