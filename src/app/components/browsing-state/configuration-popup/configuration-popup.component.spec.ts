import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationPopupComponent } from './configuration-popup.component';

describe('ConfigurationPopupComponent', () => {
  let component: ConfigurationPopupComponent;
  let fixture: ComponentFixture<ConfigurationPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfigurationPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfigurationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
