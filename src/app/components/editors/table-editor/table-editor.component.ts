import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TableService } from '../../../services/table.service';
import { DataSource } from '../../../models/datasource-config.model';
import { GetRowsOptions } from 'src/app/models/table.model';

@Component({
  selector: 'app-table-editor',
  templateUrl: './table-editor.component.html',
  styleUrls: ['./table-editor.component.css'],
})
export class TableEditorComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() tableName?: string;
  @Input() source?: DataSource;
  @ViewChild('sentinel') sentinel: ElementRef;

  columns: any[] = [];
  searchString: string = '';
  selectedColumn: string | null = null;
  rows: any[] = [];
  form: FormGroup;
  editMode: { [key: number]: boolean } = {}; // Tracks edited rows
  errorMessage: string = '';
  showModal = false;
  loading: boolean = false;

  loadingMore = false;
  page = 1;
  pageSize = 15;

  private observer!: IntersectionObserver;

  constructor(private tableService: TableService) {}

  ngOnInit() {
    if (this.tableName && this.source) {
      this.loadTableData();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tableName'] && !changes['tableName'].firstChange) {
      this.loadTableData();
    }
  }

  ngAfterViewInit() {
    this.setupIntersectionObserver();
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];

        if (target.isIntersecting && !this.loadingMore) {
          this.loadMoreRows();
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

  loadTableData() {
    this.fetchTableStructure();
    this.fetchRows({
      limit: this.pageSize,
    });
  }

  fetchTableStructure() {
    this.loading = true;
    this.tableService.getTableStructure(this.tableName!).subscribe(
      (data) => {
        this.columns = data.columns;
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching table structure:', error);
        this.errorMessage = 'Failed to load table structure.';
        this.loading = false;
      }
    );
  }

  search() {
    this.errorMessage = '';

    if (!this.selectedColumn || this.searchString.trim() === '') {
      return;
    }

    if (this.selectedColumn === 'All') {
      this.fetchRows();
      return;
    }

    const options: GetRowsOptions = {
      filterBy: [
        {
          column: this.selectedColumn,
          operator: 'LIKE',
          value: `%${this.searchString}%`,
        },
      ],
    };

    this.fetchRows(options);
  }

  fetchRows(options?: GetRowsOptions) {
    this.loading = true;
    this.tableService.getRows(this.tableName!, options).subscribe(
      (data) => {
        this.rows = data.rows;
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching rows:', error);
        this.errorMessage = 'Failed to load rows.';
        this.loading = false;
      }
    );
  }

  addRow(form: FormGroup) {
    if (form.invalid) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    const newRow = this.tableService.preprocessRowData(
      form.value,
      this.columns
    );

    const tempId = `temp_${Date.now()}`;
    const tempRow = { ...newRow, id: tempId };

    this.rows.push(tempRow);

    this.tableService.insertRow(this.tableName!, newRow).subscribe(
      (savedRow) => {
        const index = this.rows.findIndex((r) => r.id === tempId);
        if (index !== -1) {
          this.rows[index] = savedRow;
        }
        this.closeModal();
        form.reset();
      },
      (error) => {
        console.error('Error adding row:', error);
        this.rows = this.rows.filter((r) => r.id !== tempId);
        this.errorMessage = 'Failed to add row.';
      }
    );
  }

  editRow(rowIndex: number) {
    this.editMode[rowIndex] = true;
  }

  saveRow(row: any, rowIndex: number) {
    this.tableService.updateRow(this.tableName!, row).subscribe(
      () => {
        this.editMode[rowIndex] = false;
      },
      (error) => {
        console.error('Error updating row:', error);
        this.errorMessage = 'Failed to update row.';
      }
    );
  }

  deleteRow(rowId: number, rowIndex: number) {
    const deletedRow = this.rows.splice(rowIndex, 1)[0];

    this.tableService.deleteRow(this.tableName!, rowId).subscribe(
      () => {
        // Successfully deleted
      },
      (error) => {
        console.error('Error deleting row:', error);
        this.rows.splice(rowIndex, 0, deletedRow);
        this.errorMessage = 'Failed to delete row.';
      }
    );
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  onColumnSelect(column: string) {
    this.errorMessage = '';
    if (this.selectedColumn !== column && column === 'All') {
      this.fetchRows();
    }
    this.selectedColumn = column;
  }

  get columnNames(): string[] {
    return ['All', ...this.columns.map((col) => col.name)];
  }

  displayColumnDropdownLabel(selectedItemLabel: string): string {
    return `Column: ${selectedItemLabel}`;
  }

  onTableScroll(event: Event) {
    const target = event.target as HTMLElement;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 50) {
      this.loadMoreRows();
    }
  }

  loadMoreRows() {
    if (this.loadingMore) return;

    this.loadingMore = true;
    const options: GetRowsOptions = {
      offset: this.page * this.pageSize,
      limit: this.pageSize,
    };

    this.tableService.getRows(this.tableName!, options).subscribe(
      (data) => {
        if (data.rows.length > 0) {
          this.rows = [...this.rows, ...data.rows];
          this.page++;
        }
        this.loadingMore = false;
      },
      (error) => {
        console.error('Error fetching more rows:', error);
        this.loadingMore = false;
      }
    );
  }
}
