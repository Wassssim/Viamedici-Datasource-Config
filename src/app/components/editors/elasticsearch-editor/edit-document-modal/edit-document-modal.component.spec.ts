import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDocumentModalComponent } from './edit-document-modal.component';

describe('EditDocumentModalComponent', () => {
  let component: EditDocumentModalComponent;
  let fixture: ComponentFixture<EditDocumentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditDocumentModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditDocumentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
