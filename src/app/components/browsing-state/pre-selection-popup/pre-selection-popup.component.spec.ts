import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreSelectionPopupComponent } from './pre-selection-popup.component';

describe('PreSelectionPopupComponent', () => {
  let component: PreSelectionPopupComponent;
  let fixture: ComponentFixture<PreSelectionPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PreSelectionPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PreSelectionPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
