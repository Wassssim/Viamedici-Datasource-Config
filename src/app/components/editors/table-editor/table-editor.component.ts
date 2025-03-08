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
    this.tableService.getTableStructure(this.tableName, this.source).subscribe(
      (data) => {
        this.columns = data.columns;
        this.createForm();
      },
      (error) => {
        console.error('Error fetching table structure:', error);
        this.errorMessage = 'Failed to load table structure.';
      }
    );
  }

  search() {
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
    this.tableService.getRows(this.tableName, options).subscribe(
      (data) => {
        this.rows = data.rows;
      },
      (error) => {
        console.error('Error fetching rows:', error);
        this.errorMessage = 'Failed to load rows.';
      }
    );
  }

  createForm() {
    let formControls = {};
    this.columns.forEach((col) => {
      formControls[col.name] = [
        col.default || '',
        col.required ? Validators.required : [],
      ];
    });
    this.form = this.fb.group(formControls);
  }

  addRow() {
    if (this.form.invalid) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    const newRow = { ...this.form.value };
    this.rows.push(newRow); // **Optimistic UI Update**
    this.form.reset(); // Reset form after adding

    this.tableService.insertRow(this.tableName, newRow).subscribe(
      (savedRow) => {
        const index = this.rows.indexOf(newRow);
        this.rows[index] = savedRow; // Replace temp row with actual response
        this.closeModal();
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
