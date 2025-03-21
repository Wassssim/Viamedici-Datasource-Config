import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-key-value-editor',
  templateUrl: './key-value-editor.component.html',
  styleUrls: ['./key-value-editor.component.css'],
})
export class KeyValueEditorComponent {
  @Input() data: { key: string; value: string }[] = [];
  @Input() isSaving = false;
  @Output() fileUpdated = new EventEmitter<Record<string, string>>();

  updateValue(index: number, value: string) {
    this.data[index].value = value;
  }

  updateKey(index: number, newKey: string) {
    this.data[index].key = newKey;
  }

  addEntry() {
    this.data.push({ key: `new_key_${this.data.length + 1}`, value: '' });
  }

  deleteEntry(index: number) {
    this.data.splice(index, 1);
  }

  updateFile() {
    const updatedData = this.data.reduce((acc, entry) => {
      acc[entry.key] = entry.value;
      return acc;
    }, {} as Record<string, string>);
    this.fileUpdated.emit(updatedData);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
