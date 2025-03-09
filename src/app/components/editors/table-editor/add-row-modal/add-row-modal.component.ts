import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-row-modal',
  templateUrl: './add-row-modal.component.html',
  styleUrls: ['./add-row-modal.component.css'],
})
export class AddRowModalComponent implements OnChanges {
  @Input() showModal = false;
  @Input() editMode = false;
  @Input() selectedItem: any = null;
  @Input() columns: any[] = []; // Receive columns from TableEditorComponent
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() saveItemEvent = new EventEmitter<any>();

  submitted = false;
  form: FormGroup = this.fb.group({});

  constructor(private fb: FormBuilder) {}

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
