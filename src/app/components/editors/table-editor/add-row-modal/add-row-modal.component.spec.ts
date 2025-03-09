import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRowModalComponent } from './add-row-modal.component';

describe('AddRowModalComponent', () => {
  let component: AddRowModalComponent;
  let fixture: ComponentFixture<AddRowModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddRowModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddRowModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
