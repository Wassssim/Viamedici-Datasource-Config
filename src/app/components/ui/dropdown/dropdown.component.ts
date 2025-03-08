import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css'],
})
export class DropdownComponent<T> {
  @Input() items: T[] = []; // Generic type for flexibility
  @Input() placeholder: string = 'Select an item'; // Custom placeholder text
  @Input() displayFn: (item: T) => string = (item) => String(item); // Function to display items
  @Output() selectionChange = new EventEmitter<T>();

  selectedItem: T | null = null;

  selectItem(item: T): void {
    this.selectedItem = item;
    this.selectionChange.emit(item);
  }
}
