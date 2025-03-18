import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { DocumentsService } from '../../../services/documents.service';
import { response } from 'express';
import { getKeys } from 'src/app/helpers/utils';

@Component({
  selector: 'app-elasticsearch-editor',
  templateUrl: './elasticsearch-editor.component.html',
  styleUrls: ['./elasticsearch-editor.component.css'],
})
export class ElasticsearchEditorComponent implements OnInit, AfterViewInit {
  @ViewChild('sentinel') sentinel: ElementRef;

  @Input('id') sourceId;
  @Output() exit = new EventEmitter<any>();

  indices: string[] = [];
  documents: any[] = [];
  selectedIndex: string | null = null;
  editingDocumentId: string | null = null;
  editingDocumentIndex: number | null = null;
  jsonString: string = '';
  errorMessage: string = '';
  loading: boolean = true;
  loadingDocuments: boolean = false;
  searchString = undefined;
  indexSchema = {};

  showFilters = false;
  filterFields: { name: string; selected: boolean }[] = [];

  page = 1;
  pageSize = 15;
  stopInfiniteScroll = false;

  /* Document Viewer */
  viewingDocumentId: string;

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

  toggleFilterDropdown() {
    this.showFilters = !this.showFilters;
  }

  fetchIndices() {
    this.loading = true;
    this.documentsService.getIndices(this.sourceId).subscribe(
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

  handleIndexListChange() {
    this.documentsService
      .getSchema(this.sourceId, this.selectedIndex)
      .subscribe((response) => {
        this.indexSchema = response;

        this.filterFields = getKeys(response).map((k) => ({
          name: k,
          selected: false,
        }));
      });
    this.loadDocuments();
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
        this.sourceId,
        this.selectedIndex,
        this.searchString,
        this.filterFields.map((field) => field.name),
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

  editDocument(doc: any, idx: number) {
    this.editingDocumentId = doc._id;
    this.editingDocumentIndex = idx;
    this.jsonString = JSON.stringify({ ...doc }, null, 2);
  }

  cancelEdit() {
    this.editingDocumentId = null;
  }

  deleteDocument(docId: string) {
    this.documentsService
      .deleteDocument(this.sourceId, this.selectedIndex, docId)
      .subscribe(
        () => this.loadDocuments(),
        (error) => console.error('Error deleting document', error)
      );
  }

  openModal() {
    (document.getElementById('addDocumentModal') as any).style.display =
      'block';
  }

  onDocumentAdded(newDoc: any) {
    this.documentsService
      .addDocument(this.sourceId, this.selectedIndex, newDoc)
      .subscribe(
        () => this.loadDocuments(),
        (error) => console.error('Error adding document', error)
      );
  }

  onDocumentEditClose() {
    this.editingDocumentId = null;
  }

  onDocumentEdited(newDoc: any) {
    if (!this.editingDocumentIndex) return;

    this.documentsService
      .getDocument(
        this.sourceId,
        this.selectedIndex,
        this.editingDocumentId,
        true
      )
      .subscribe((res) => {
        const newDocuments = [...this.documents];
        newDocuments[this.editingDocumentIndex] = {
          ...newDocuments[this.editingDocumentIndex],
          ...res,
        };

        this.documents = newDocuments;
        this.onDocumentEditClose();
      });
  }

  search() {
    this.errorMessage = '';
    this.searchString = this.searchString.trim();
    this.loadDocuments();
  }

  goBack() {
    this.exit.emit();
  }

  viewDocument(documentId: string) {
    this.viewingDocumentId = documentId;
  }

  closeViewModal() {
    this.viewingDocumentId = null;
  }
}
