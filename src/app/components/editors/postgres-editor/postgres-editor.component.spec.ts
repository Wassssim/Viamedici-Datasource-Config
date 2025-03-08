import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostgresEditorComponent } from './postgres-editor.component';

describe('PostgresEditorComponent', () => {
  let component: PostgresEditorComponent;
  let fixture: ComponentFixture<PostgresEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostgresEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostgresEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
