import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { parseSchema } from 'src/app/helpers/elasticUtils';

@Component({
  selector: 'app-json-key-value-editor',
  templateUrl: './json-key-value-editor.component.html',
  styleUrls: ['./json-key-value-editor.component.css'],
})
export class JsonKeyValueEditorComponent {
  @Input() schema: Record<string, any> = {};
  @Input() data: Record<string, any> = {};
  @Output() dataChange = new EventEmitter<any>();

  expandedKeys: Set<string> = new Set();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['schema'] && !changes['schema'].firstChange) {
      this.data = parseSchema(this.schema);
    }
  }

  getDefaultValueForType(type: string) {
    switch (type) {
      case 'number':
        return 0;
      case 'boolean':
        return false;
      case 'string':
        return '';
      case 'array':
        return [];
      case 'Date':
        return new Date().toISOString().split('T')[0];
      default:
        return ''; // Default fallback for unknown types
    }
  }

  toggleExpand(key: string) {
    if (this.expandedKeys.has(key)) {
      this.expandedKeys.delete(key);
    } else {
      this.expandedKeys.add(key);
    }
  }

  onKeyChange(oldKey: string, newKey: string) {
    if (!newKey || oldKey === newKey) return;
    this.data[newKey] = this.data[oldKey];
    delete this.data[oldKey];
    this.dataChange.emit(this.data);
  }

  onValueChange(key: string, newValue: any) {
    this.data[key] = newValue;
    this.dataChange.emit(this.data);
  }

  removeKey(key: string) {
    delete this.data[key];
    this.dataChange.emit(this.data);
  }

  // New methods for handling arrays
  onArrayValueChange(key: string, index: number, newValue: any) {
    this.data[key][index] = newValue;
    this.dataChange.emit(this.data);
  }

  onArrayObjectChange(key: string, index: number, newValue: any) {
    this.data[key][index] = newValue;
    this.dataChange.emit(this.data);
  }

  addArrayItem(key: string) {
    this.data[key] = this.data[key] || [];
    this.data[key].push(this.getDefaultValueForType('string')); // Default to string
    this.dataChange.emit(this.data);
  }

  removeArrayItem(key: string, index: number) {
    this.data[key].splice(index, 1);
    this.dataChange.emit(this.data);
  }

  isObject(value: any): boolean {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  isNumber(value: any): boolean {
    return typeof value === 'number';
  }

  isBoolean(value: any): boolean {
    return typeof value === 'boolean';
  }

  isString(value: any): boolean {
    return typeof value === 'string';
  }

  isPrimitive(value: any): boolean {
    return (
      this.isString(value) || this.isNumber(value) || this.isBoolean(value)
    );
  }
}
