import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorMessageCardComponent } from './error-message-card.component';

describe('ErrorMessageCardComponent', () => {
  let component: ErrorMessageCardComponent;
  let fixture: ComponentFixture<ErrorMessageCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ErrorMessageCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorMessageCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
