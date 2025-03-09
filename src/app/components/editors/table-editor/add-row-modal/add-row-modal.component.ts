import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { FilterCondition } from 'src/app/models/table.model';
import { TableService } from 'src/app/services/table.service';
import { distinctUntilChanged, debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-add-row-modal',
  templateUrl: './add-row-modal.component.html',
  styleUrls: ['./add-row-modal.component.css'],
})
export class AddRowModalComponent implements OnInit, OnChanges {
  @Input() showModal = false;
  @Input() editMode = false;
  @Input() selectedItem: any = null;
  @Input() columns: any[] = []; // Receive columns from TableEditorComponent
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() saveItemEvent = new EventEmitter<any>();

  submitted = false;
  form: FormGroup = this.fb.group({});

  /* Foreign Key */
  foreignKeyData: { [key: string]: any[] } = {}; // Store dropdown data
  searchTerms: { [key: string]: string } = {}; // Store search text
  offsets: { [key: string]: number } = {}; // Track pagination offsets
  loading: { [key: string]: boolean } = {}; // Prevent multiple calls
  search$ = new Subject<{ term: any; columnName: string }>();

  constructor(private tableService: TableService, private fb: FormBuilder) {}

  ngOnInit() {
    this.createForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.columns && this.columns.length) {
      this.createForm();
    }
  }

  createForm() {
    let formControls = {};
    this.columns.forEach((col) => {
      if (col.type === 'json') {
        // For the JSON type column, set a default value and disable the field
        formControls[col.name] = [{ value: '{}', disabled: true }];
      } else {
        formControls[col.name] = ['', !col.default ? Validators.required : []];
      }
    });
    this.form = this.fb.group(formControls);
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  saveItem() {
    this.submitted = true;
    if (this.form.invalid) return;
    this.saveItemEvent.emit(this.form);
  }
}
