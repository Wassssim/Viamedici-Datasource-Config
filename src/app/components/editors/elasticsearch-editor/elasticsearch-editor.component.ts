import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DocumentsService } from '../../../services/documents.service';

@Component({
  selector: 'app-elasticsearch-editor',
  templateUrl: './elasticsearch-editor.component.html',
  styleUrls: ['./elasticsearch-editor.component.css'],
})
export class ElasticsearchEditorComponent implements OnInit, AfterViewInit {
  @ViewChild('sentinel') sentinel: ElementRef;

  indices: string[] = [];
  documents: any[] = [];
  selectedIndex: string | null = null;
  editingDocumentId: string | null = null;
  editedDocument: any = {};
  jsonString: string = '';
  errorMessage: string = '';
  loading: boolean = true;
  loadingDocuments: boolean = false;
  searchString = undefined;

  page = 1;
  pageSize = 15;
  stopInfiniteScroll = false;

  private observer!: IntersectionObserver;

  constructor(private documentsService: DocumentsService) {}

  ngOnInit(): void {
    this.fetchIndices();
  }

  ngAfterViewInit() {
    this.setupIntersectionObserver();
  }

  setupIntersectionObserver() {
    console.log('setupIntersectionObserver', this.sentinel);

    this.observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];

        if (
          target.isIntersecting &&
          !this.loadingDocuments &&
          !this.stopInfiniteScroll
        ) {
          console.log('loading more');

          this.loadDocuments(false);
        }
      },
      {
        root: null, // Observes viewport
        rootMargin: '0px',
        threshold: 0.5, // Trigger when fully in view
      }
    );

    if (this.sentinel) {
      this.observer.observe(this.sentinel.nativeElement);
    }
  }

  fetchIndices() {
    this.loading = true;
    this.documentsService.getIndices().subscribe(
      (response) => {
        this.indices = response;
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching indices', error);
        this.errorMessage = 'Error fetching indices';
        this.loading = false;
      }
    );
  }

  loadDocuments(reset = true) {
    if (!this.selectedIndex) return;

    this.loadingDocuments = true;

    if (reset) {
      this.page = 1;
      this.stopInfiniteScroll = false;
    }

    this.documentsService
      .getDocuments(
        this.selectedIndex,
        this.searchString,
        this.page,
        this.pageSize
      )
      .subscribe(
        (response) => {
          this.documents = reset ? response : [...this.documents, ...response];
          this.loadingDocuments = false;
          if (response.length === 0) this.stopInfiniteScroll = true;
          this.page++;
        },
        (error) => {
          console.error('Error fetching documents', error);
          this.loadingDocuments = false;
        }
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

  search() {
    this.errorMessage = '';
    this.searchString = this.searchString.trim();
    this.loadDocuments();
  }
}
