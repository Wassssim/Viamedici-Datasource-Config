import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElasticsearchEditorComponent } from './elasticsearch-editor.component';

describe('ElasticsearchEditorComponent', () => {
  let component: ElasticsearchEditorComponent;
  let fixture: ComponentFixture<ElasticsearchEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ElasticsearchEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElasticsearchEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
