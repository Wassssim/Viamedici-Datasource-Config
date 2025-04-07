import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DocumentsService } from 'src/app/services/documents.service';

@Component({
  selector: 'app-edit-document-modal',
  templateUrl: './edit-document-modal.component.html',
  styleUrls: ['./edit-document-modal.component.css'],
})
export class EditDocumentModalComponent {
  @Input() schema = {};
  @Input() initialData = {};
  @Input() sourceId;
  @Input() index;
  @Input() documentId;
  @Output() documentEdited = new EventEmitter<any>();
  @Output() modalClosed = new EventEmitter<any>();

  jsonData: any = {}; // Default JSON data
  errorMessage = '';
  isLoadingDocument = true;
  isSaving = false;

  constructor(private documentService: DocumentsService) {}

  ngOnInit() {
    this.isLoadingDocument = true;
    this.documentService
      .getDocument(this.sourceId, this.index, this.documentId)
      .subscribe(
        (data) => {
          delete data['_id'];
          this.initialData = data;
          this.isLoadingDocument = false;
        },
        () => {
          this.errorMessage = 'Error loading document';
          this.isLoadingDocument = false;
        }
      );
  }

  onJsonChange(event: any) {
    if (!event.srcElement) return;

    this.jsonData = JSON.parse(event.srcElement.value);
  }

  closeModal() {
    this.modalClosed.emit();
  }

  saveDocument() {
    this.isSaving = true;
    this.documentService
      .updateDocument(this.sourceId, this.index, this.documentId, this.jsonData)
      .subscribe(
        () => {
          this.documentEdited.emit(this.jsonData);
          this.closeModal();
          this.isSaving = false;
        },
        () => {
          this.errorMessage = 'Error Updating Document';
          this.isSaving = false;
        }
      );
  }
}
