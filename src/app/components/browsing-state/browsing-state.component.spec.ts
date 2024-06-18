import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowsingStateComponent } from './browsing-state.component';

describe('BrowsingStateComponent', () => {
  let component: BrowsingStateComponent;
  let fixture: ComponentFixture<BrowsingStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BrowsingStateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BrowsingStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
