import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';

@Component({
  selector: 'app-add-document-modal',
  templateUrl: './add-document-modal.component.html',
  styleUrls: ['./add-document-modal.component.css'],
})
export class AddDocumentModalComponent {
  @Output() documentAdded = new EventEmitter<any>();
  @ViewChild(JsonEditorComponent, { static: false })
  editor: JsonEditorComponent;

  editorOptions: JsonEditorOptions;
  jsonData: any = {}; // Default JSON data

  constructor() {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'text';
    this.editorOptions.mainMenuBar = false;
    //this.options.mode = 'code'; //set only one mode

    this.jsonData = {};
  }

  onJsonChange(event: any) {
    if (!event.srcElement) return;

    this.jsonData = JSON.parse(event.srcElement.value);
  }

  closeModal() {
    (document.getElementById('addDocumentModal') as any).style.display = 'none';
  }

  saveDocument() {
    this.documentAdded.emit(this.jsonData);
    this.closeModal();
  }
}
