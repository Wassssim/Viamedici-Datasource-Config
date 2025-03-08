import { Component, OnInit } from '@angular/core';
import { DocumentsService } from '../../../services/documents.service';

@Component({
  selector: 'app-elasticsearch-editor',
  templateUrl: './elasticsearch-editor.component.html',
  styleUrls: ['./elasticsearch-editor.component.css'],
})
export class ElasticsearchEditorComponent implements OnInit {
  indices: string[] = [];
  documents: any[] = [];
  selectedIndex: string | null = null;
  editingDocumentId: string | null = null;
  editedDocument: any = {};
  jsonString: string = '';

  constructor(private documentsService: DocumentsService) {}

  ngOnInit(): void {
    this.fetchIndices();
  }

  fetchIndices() {
    this.documentsService.getIndices().subscribe(
      (response) => (this.indices = response),
      (error) => console.error('Error fetching indices', error)
    );
  }

  loadDocuments() {
    if (!this.selectedIndex) return;

    this.documentsService.getDocuments(this.selectedIndex).subscribe(
      (response) => (this.documents = response),
      (error) => console.error('Error fetching documents', error)
    );
  }

  editDocument(doc: any) {
    this.editingDocumentId = doc.id;
    this.editedDocument = { ...doc }; // Clone the document for editing
    this.jsonString = JSON.stringify(this.editedDocument, null, 2);
  }

  updateEditedDocument() {
    try {
      this.editedDocument = JSON.parse(this.jsonString); // Convert text back to object
    } catch (e) {
      console.error('Invalid JSON:', e);
    }
  }

  cancelEdit() {
    this.editingDocumentId = null;
    this.editedDocument = {};
  }

  saveDocument() {
    if (!this.editingDocumentId) return;

    this.documentsService
      .updateDocument(
        this.selectedIndex,
        this.editingDocumentId,
        this.editedDocument
      )
      .subscribe(
        () => {
          //this.loadDocuments();
          this.documents = this.documents.map((doc) =>
            doc.id === this.editingDocumentId ? { ...this.editedDocument } : doc
          );
          this.cancelEdit();
        },
        (error) => console.error('Error updating document', error)
      );
  }

  deleteDocument(docId: string) {
    this.documentsService.deleteDocument(this.selectedIndex, docId).subscribe(
      () => this.loadDocuments(),
      (error) => console.error('Error deleting document', error)
    );
  }

  openModal() {
    (document.getElementById('addDocumentModal') as any).style.display =
      'block';
  }

  onDocumentAdded(newDoc: any) {
    this.documentsService.addDocument(this.selectedIndex, newDoc).subscribe(
      () => this.loadDocuments(),
      (error) => console.error('Error adding document', error)
    );
  }
}
