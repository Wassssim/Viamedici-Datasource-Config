import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DocumentsService } from 'src/app/services/documents.service';
@Component({
  selector: 'app-add-document-modal',
  templateUrl: './add-document-modal.component.html',
  styleUrls: ['./add-document-modal.component.css'],
})
export class AddDocumentModalComponent {
  @Input() schema = {};
  @Input() sourceId;
  @Input() selectedIndex;
  @Output() documentAdded = new EventEmitter<any>();

  jsonData: any = {}; // Default JSON data
  errorMessage = '';
  isSaving = false;

  constructor(private documentsService: DocumentsService) {}

  onJsonChange(event: any) {
    if (!event.srcElement) return;

    this.jsonData = JSON.parse(event.srcElement.value);
  }

  closeModal() {
    (document.getElementById('addDocumentModal') as any).style.display = 'none';
  }

  saveDocument() {
    this.isSaving = true;
    this.documentsService
      .addDocument(this.sourceId, this.selectedIndex, this.jsonData)
      .subscribe(
        () => {
          this.isSaving = false;
          this.documentAdded.emit();
          this.closeModal();
        },
        (error) => {
          this.isSaving = false;
          console.error('Error adding document', error);
          this.errorMessage = 'Error adding document: ' + error.error.error;
        }
      );
  }
}
