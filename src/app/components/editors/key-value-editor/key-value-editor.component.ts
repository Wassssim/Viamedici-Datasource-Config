import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';

@Component({
  selector: 'app-key-value-editor',
  templateUrl: './key-value-editor.component.html',
  styleUrls: ['./key-value-editor.component.css'],
})
export class KeyValueEditorComponent {
  @Input() data: {
    originalKey: string;
    updated: boolean;
    key: string;
    value: string;
  }[] = [];
  @Input() isSaving = false;
  @Output() fileUpdated = new EventEmitter<any>();

  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport; // Virtual Scroll Viewport
  @ViewChildren('keyInput') keyInputs!: QueryList<ElementRef>; // References to input fields

  updateValue(index: number, value: string) {
    if (this.data[index].value === value) return;
    this.data[index].updated = true;
    this.data[index].value = value;
  }

  updateKey(index: number, newKey: string) {
    if (this.data[index].key === newKey) return;
    this.data[index].updated = true;
    this.data[index].key = newKey;
  }

  addEntry() {
    this.data = [
      ...this.data,
      {
        originalKey: null,
        updated: true,
        key: `new_key_${this.data.length + 1}`,
        value: '',
      },
    ];

    setTimeout(() => {
      this.viewport.checkViewportSize(); // Refresh virtual scroll
      this.viewport.scrollToIndex(this.data.length - 1); // Scroll to new entry
      setTimeout(() => {
        const lastInput = this.keyInputs.last;
        if (lastInput) {
          lastInput.nativeElement.focus();
        }
      }, 50);
    }, 100);
  }

  deleteEntry(index: number) {
    this.data.splice(index, 1);
    this.data = [...this.data];
  }

  updateFile() {
    const updatedData = this.data.filter(
      (entry) =>
        entry.updated ||
        entry.originalKey === null ||
        entry.key !== entry.originalKey
    );

    this.fileUpdated.emit(updatedData);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
