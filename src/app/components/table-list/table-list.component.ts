import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-table-list',
  templateUrl: './table-list.component.html',
  styleUrls: ['./table-list.component.css'],
})
export class TableListComponent {
  @Input() tables: string[] = [];
  @Output() selectEvent = new EventEmitter<string>();
  dropdownOpen = false;
  selectedTable: string;

  constructor() {}

  selectTable(table: string): void {
    this.selectEvent.emit(table);
    this.selectedTable = table;
    this.dropdownOpen = false; // Close dropdown after selection
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
}
