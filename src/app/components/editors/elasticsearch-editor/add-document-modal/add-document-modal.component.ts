import { Component, EventEmitter, Input, Output } from '@angular/core';
@Component({
  selector: 'app-add-document-modal',
  templateUrl: './add-document-modal.component.html',
  styleUrls: ['./add-document-modal.component.css'],
})
export class AddDocumentModalComponent {
  @Input() schema = {};
  @Output() documentAdded = new EventEmitter<any>();

  jsonData: any = {}; // Default JSON data

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
