import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-json-array-editor',
  templateUrl: './json-array-editor.component.html',
  styleUrls: ['./json-array-editor.component.css'],
})
export class JsonArrayEditorComponent {
  @Input() data: any[] = [];
  @Input() schema: Record<string, any> = {};
  @Output() dataChange = new EventEmitter<any[]>();
  collapsed: boolean = true;

  isPrimitive(value: any): boolean {
    return typeof value !== 'object' || value === null;
  }

  onPrimitiveChange(index: number, newValue: any) {
    this.data[index] = newValue;
    this.dataChange.emit(this.data);
  }

  onObjectChange(index: number, newValue: any) {
    this.data[index] = newValue;
    this.dataChange.emit(this.data);
  }

  addItem() {
    if (this.isPrimitive(this.schema[0])) {
      this.data.push('');
    } else {
      // Create a new object based on the schema structure
      const newItem: Record<string, any> = {};
      Object.keys(this.schema[0]).forEach((key) => {
        newItem[key] = this.getDefaultValueForType(this.schema[0][key]);
      });

      this.data.push(newItem);
    }
    this.dataChange.emit(this.data);
  }

  removeItem(index: number) {
    this.data.splice(index, 1);
    this.dataChange.emit(this.data);
  }

  getDefaultValueForType(type: string) {
    switch (type) {
      case 'number':
        return 0;
      case 'boolean':
        return false;
      case 'string':
        return '';
      default:
        return {}; // Default for objects
    }
  }

  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }
}
