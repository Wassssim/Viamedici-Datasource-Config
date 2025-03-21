import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TableService } from '../../../services/table.service';
import { DataSource } from '../../../models/datasource-config.model';
import { Column, GetRowsOptions } from 'src/app/models/table.model';

@Component({
  selector: 'app-table-editor',
  templateUrl: './table-editor.component.html',
  styleUrls: ['./table-editor.component.css'],
})
export class TableEditorComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() sourceType: DataSource;
  @Input('id') sourceId;
  @Output() exit = new EventEmitter<any>();
  @ViewChild('sentinel') sentinel: ElementRef;

  tables: string[] = null;
  selectedTable: string | null = null;

  columns: Column[] = [];
  primaryKeys: Column[] = [];

  searchString: string = '';
  selectedColumn: string | null = null;
  rows: any[] = [];
  form: FormGroup;
  editMode: { [key: number]: boolean } = {}; // Tracks edited rows
  errorMessage: string = '';
  showModal = false;
  loading: boolean = false;
  editingRow: any;

  loadingRows = false;
  page = 1;
  pageSize = 15;
  isLastPage = false;

  private observer!: IntersectionObserver;

  constructor(private tableService: TableService) {}

  ngOnInit() {
    this.loadTables();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tableName'] && !changes['tableName'].firstChange) {
      this.resetComponentState();
      this.loadTableData();
    }
  }

  ngAfterViewInit() {
    this.setupIntersectionObserver();
  }

  loadTables(): void {
    this.tableService.getTables(this.sourceType, this.sourceId).subscribe(
      (res) => {
        this.tables = res.tables;
      },
      (err) => (this.errorMessage = 'Error Loading Tables')
    );
  }

  handleTableSelect(tableName: string) {
    this.selectedTable = tableName;
    if (this.selectedTable) {
      this.loadTableData();
    }
  }

  resetComponentState() {
    // Clear any existing rows, columns, search string, and pagination state
    this.rows = [];
    this.columns = [];
    this.searchString = '';
    this.selectedColumn = null;
    this.editMode = {};
    this.errorMessage = '';
    this.page = 1;
    this.isLastPage = false;
    this.loadingRows = false;
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];

        if (
          target.isIntersecting &&
          !this.loadingRows &&
          this.sourceId !== null &&
          this.selectedTable !== null
        ) {
          this.fetchRows({}, false);
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
    this.fetchRows();
  }

  fetchTableStructure() {
    this.loading = true;
    this.tableService
      .getTableStructure(this.sourceType, this.sourceId, this.selectedTable!)
      .subscribe(
        (data) => {
          this.columns = data.columns;
          this.primaryKeys = this.columns.filter(
            (c) => c.constraints.primaryKey
          );
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

    if (!this.selectedColumn) {
      return;
    }

    this.searchString = this.searchString.trim();

    this.fetchRows({});
  }

  fetchRows(opt?: GetRowsOptions, reset = true) {
    this.loadingRows = true;

    const filterBy = [...(opt?.filterBy ?? [])];

    if (
      this.selectedColumn &&
      this.selectedColumn !== 'All' &&
      this.searchString !== ''
    ) {
      filterBy.push({
        column: this.selectedColumn,
        operator: 'LIKE',
        value: `%${this.searchString}%`,
      });
    }

    if (reset) {
      this.page = 1;
      this.isLastPage = false;
    } else if (this.isLastPage) {
      this.loadingRows = false;
      return;
    }

    const options: GetRowsOptions = {
      ...opt,
      offset: (this.page - 1) * this.pageSize,
      limit: this.pageSize,
      filterBy,
    };

    this.tableService
      .getRows(this.sourceType, this.sourceId, this.selectedTable!, options)
      .subscribe(
        (data) => {
          if (reset) {
            this.rows = data.rows;
          } else {
            this.rows = [...this.rows, ...data.rows];
          }
          if (data.rows.length > 0) {
            this.page++;
          } else {
            this.isLastPage = true;
          }

          this.loadingRows = false;
        },
        (error) => {
          console.error('Error fetching rows:', error);
          this.errorMessage = 'Failed to load rows.';
          this.loadingRows = false;
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

    this.tableService
      .insertRow(this.sourceType, this.sourceId, this.selectedTable!, newRow)
      .subscribe(
        (response) => {
          const index = this.rows.findIndex((r) => r.id === tempId);
          if (index !== -1) {
            this.rows[index] = response.row;
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

  saveRow(form: FormGroup, rowIndex: number) {
    const row = this.tableService.preprocessRowData(form.value, this.columns);

    this.tableService
      .updateRow(
        this.sourceType,
        this.sourceId,
        this.selectedTable!,
        row,
        this.rows[rowIndex].id
      )
      .subscribe(
        () => {
          this.tableService
            .getRows(this.sourceType, this.sourceId, this.selectedTable, {
              filterBy: this.primaryKeys.map((k) => ({
                column: k.name,
                value: this.rows[rowIndex][k.name] + '',
                operator: '=',
              })),
              limit: 1,
            })
            .subscribe((res) => {
              if (res.rows?.length > 0) this.rows[rowIndex] = res.rows[0];
            });

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

    this.tableService
      .deleteRow(this.sourceType, this.sourceId, this.selectedTable!, rowId)
      .subscribe(
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

  closeEditModal(rowIndex) {
    this.editMode[rowIndex] = false;
  }

  onColumnSelect(column: string) {
    this.errorMessage = '';
    if (this.selectedColumn !== column && column === 'None') {
      this.fetchRows();
    }
    this.selectedColumn = column;
  }

  get columnNames(): string[] {
    return ['None', ...this.columns.map((col) => col.name)];
  }

  displayColumnDropdownLabel(selectedItemLabel: string): string {
    return `Column: ${selectedItemLabel}`;
  }

  onTableScroll(event: Event) {
    const target = event.target as HTMLElement;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 50) {
      this.fetchRows();
    }
  }

  goBack() {
    this.exit.emit();
  }
}
