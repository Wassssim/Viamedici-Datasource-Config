import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsonKeyValueEditorComponent } from './json-key-value-editor.component';

describe('JsonKeyValueEditorComponent', () => {
  let component: JsonKeyValueEditorComponent;
  let fixture: ComponentFixture<JsonKeyValueEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JsonKeyValueEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JsonKeyValueEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
