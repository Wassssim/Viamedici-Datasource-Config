import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { DocumentsService } from '../../../services/documents.service';
import { getElasticsearchMappingKeys } from 'src/app/helpers/elasticUtils';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-elasticsearch-editor',
  templateUrl: './elasticsearch-editor.component.html',
  styleUrls: ['./elasticsearch-editor.component.css'],
})
export class ElasticsearchEditorComponent implements OnInit, AfterViewInit {
  @ViewChild('sentinel') sentinel: ElementRef;

  @Input('id') sourceId;

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

  filterSearchTerm: string = '';
  searchSubject = new Subject<string>();
  destroy$ = new Subject<void>();
  showFilters = false;
  selectAllFilters = false;
  selectedFieldCount: number = 0;
  filterFields: { name: string; selected: boolean; show: boolean }[] = [];

  page = 1;
  pageSize = 15;
  stopInfiniteScroll = false;

  /* Document Viewer */
  viewingDocumentId: string;

  private observer!: IntersectionObserver;

  constructor(private documentsService: DocumentsService) {}

  ngOnInit(): void {
    this.fetchIndices();
    this.searchSubject
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.filterSearchTerm = term;
        this.updateFilterList();
      });
  }

  ngAfterViewInit() {
    this.setupIntersectionObserver();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sourceId'] && !changes['sourceId'].firstChange) {
      this.resetState();
      this.fetchIndices();
    }
  }

  resetState() {
    this.indices = [];
    this.documents = [];
    this.selectedIndex = null;
    this.editingDocumentId = null;
    this.editingDocumentIndex = null;
    this.jsonString = '';
    this.errorMessage = '';
    this.loading = true;
    this.loadingDocuments = false;
    this.searchString = undefined;
    this.indexSchema = {};

    this.showFilters = false;
    this.selectAllFilters = false;
    this.selectedFieldCount = 0;
    this.filterFields = [];

    this.page = 1;
    this.pageSize = 15;
    this.stopInfiniteScroll = false;

    this.viewingDocumentId = null;
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];

        if (
          target.isIntersecting &&
          !this.loadingDocuments &&
          !this.stopInfiniteScroll &&
          (!this.errorMessage || this.errorMessage === '')
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

  updateSelectedFieldCount() {
    this.selectedFieldCount = this.filterFields.filter(
      (field) => field.selected
    ).length;
  }

  toggleFilterDropdown() {
    this.showFilters = !this.showFilters;
  }

  onSearchInputChange(term: string) {
    this.searchSubject.next(term);
  }

  updateFilterList() {
    this.filterFields = this.filterFields.map((f) => ({
      ...f,
      show: f.name.includes(this.filterSearchTerm) ? true : false,
    }));
  }

  toggleSelectAll() {
    this.filterFields.forEach(
      (field) => (field.selected = this.selectAllFilters)
    );
    this.selectedFieldCount = this.selectAllFilters
      ? this.filterFields.length
      : 0;
  }

  onCheckboxChange() {
    this.updateSelectedFieldCount();
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
        this.indexSchema = response.convertedSchema;

        this.filterFields = getElasticsearchMappingKeys(this.indexSchema).map(
          (k) => ({
            name: k,
            selected: false,
            show: k.includes(this.filterSearchTerm),
          })
        );

        this.filterFields = [
          {
            name: '_id',
            selected: false,
            show: true,
          },
          ...this.filterFields,
        ];
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
        this.filterFields
          .filter((field) => field.selected)
          .map((field) => field.name),
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

          console.log(error);
          if (error.status === 400) this.errorMessage = error.error.message;
          else this.errorMessage = 'Error fetching documents';
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

  onDocumentAdded() {
    this.loadDocuments();
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

  viewDocument(documentId: string) {
    this.viewingDocumentId = documentId;
  }

  closeViewModal() {
    this.viewingDocumentId = null;
  }
}
