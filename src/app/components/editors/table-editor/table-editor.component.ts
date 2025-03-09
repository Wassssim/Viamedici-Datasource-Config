import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableService } from '../../../services/table.service';
import { DataSource } from '../../../models/datasource-config.model';
import { GetRowsOptions } from 'src/app/models/table.model';

@Component({
  selector: 'app-table-editor',
  templateUrl: './table-editor.component.html',
  styleUrls: ['./table-editor.component.css'],
})
export class TableEditorComponent implements OnInit, OnChanges {
  @Input() tableName: string;
  @Input() source: DataSource;

  columns: any[] = [];
  searchString: string = null;
  selectedColumn: string | null = null;
  rows: any[] = [];
  form: FormGroup;
  editMode: { [key: number]: boolean } = {}; // Tracks edited rows
  errorMessage: string = '';
  showModal = false;
  loading: boolean = false;

  constructor(private tableService: TableService, private fb: FormBuilder) {}

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

  loadTableData() {
    this.fetchTableStructure();
    this.fetchRows();
  }

  fetchTableStructure() {
    this.loading = true; // Start loading
    this.tableService.getTableStructure(this.tableName).subscribe(
      (data) => {
        this.columns = data.columns;
        this.loading = false; // Stop loading
      },
      (error) => {
        console.error('Error fetching table structure:', error);
        this.errorMessage = 'Failed to load table structure.';
        this.loading = false; // Stop loading
      }
    );
  }

  search() {
    if (this.errorMessage) this.errorMessage = null;

    if (
      !this.selectedColumn ||
      !this.searchString ||
      this.searchString.length === 0
    )
      return;

    if (this.selectedColumn === 'All') {
      this.fetchRows();
      return;
    }

    const options = {
      filterBy: [
        {
          column: this.selectedColumn,
          operator: 'LIKE',
          value: '%' + this.searchString + '%',
        },
      ],
    } as GetRowsOptions;

    this.fetchRows(options);
  }

  fetchRows(options?: GetRowsOptions) {
    this.loading = true; // Start loading
    this.tableService.getRows(this.tableName, options).subscribe(
      (data) => {
        this.rows = data.rows;
        this.loading = false; // Stop loading
      },
      (error) => {
        console.error('Error fetching rows:', error);
        this.errorMessage = 'Failed to load rows.';
        this.loading = false; // Stop loading
      }
    );
  }

  addRow(form) {
    if (form.invalid) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    const newRow = this.tableService.preprocessRowData(
      form.value,
      this.columns
    );
    this.rows.push(newRow); // **Optimistic UI Update**

    this.tableService.insertRow(this.tableName, newRow).subscribe(
      (savedRow) => {
        const index = this.rows.indexOf(newRow);
        this.rows[index] = savedRow; // Replace temp row with actual response
        this.closeModal();
        form.reset(); // Reset form after adding
      },
      (error) => {
        console.error('Error adding row:', error);
        this.rows.pop(); // Revert optimistic update on failure
        this.errorMessage = 'Failed to add row.';
      }
    );
  }

  editRow(rowIndex: number) {
    this.editMode[rowIndex] = true;
  }

  saveRow(row: any, rowIndex: number) {
    this.tableService.updateRow(this.tableName, row).subscribe(
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
    const deletedRow = this.rows.splice(rowIndex, 1)[0]; // **Optimistic UI Update**

    this.tableService.deleteRow(this.tableName, rowId).subscribe(
      () => {
        // Successfully deleted
      },
      (error) => {
        console.error('Error deleting row:', error);
        this.rows.splice(rowIndex, 0, deletedRow); // Revert deletion on failure
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
    if (this.errorMessage) this.errorMessage = null;
    if (this.selectedColumn !== column && column === 'All') this.fetchRows();
    this.selectedColumn = column;
  }

  // Create a computed property to transform the array
  get columnNames(): string[] {
    return ['All'].concat(this.columns.map((col) => col.name));
  }

  displayColumnDropdownLabel(selectedItemLabel) {
    return 'Column: ' + selectedItemLabel;
  }
}
