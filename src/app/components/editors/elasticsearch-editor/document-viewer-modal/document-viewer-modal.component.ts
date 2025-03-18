import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DocumentsService } from 'src/app/services/documents.service';

@Component({
  selector: 'app-document-viewer-modal',
  templateUrl: './document-viewer-modal.component.html',
  styleUrls: ['./document-viewer-modal.component.css'],
})
export class DocumentViewerModalComponent implements OnInit {
  @Input() sourceId;
  @Input() index;
  @Input() documentId;

  @Output() onClose = new EventEmitter<any>();

  document: any;
  errorMessage = null;

  constructor(private documentService: DocumentsService) {}

  ngOnInit() {
    this.documentService
      .getDocument(this.sourceId, this.index, this.documentId)
      .subscribe(
        (data) => (this.document = JSON.stringify(data, null, 4)),
        (err) => (this.errorMessage = 'Error fetching document')
      );
  }

  closeModal() {
    this.onClose.emit();
  }
}
