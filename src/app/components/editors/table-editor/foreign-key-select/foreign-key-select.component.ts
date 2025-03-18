import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { TableService } from 'src/app/services/table.service';
import { Column, FilterCondition } from 'src/app/models/table.model';
import { DataSource } from 'src/app/models/datasource-config.model';

@Component({
  selector: 'app-foreign-key-select',
  templateUrl: './foreign-key-select.component.html',
  styleUrls: ['./foreign-key-select.component.css'],
})
export class ForeignKeySelectComponent implements OnInit {
  @Input() sourceType: DataSource;
  @Input() sourceId;
  @Input() column: Column; // Receive column details
  @Output() valueChange = new EventEmitter<any>(); // Emit selected value
  @Input() isInvalid: boolean = false;

  foreignKeyData: any[] = [];
  searchTerm: string = '';
  offset: number = 0;
  loading: boolean = false;

  search$ = new Subject<string>();

  constructor(private tableService: TableService) {}

  ngOnInit() {
    this.loadForeignKeyData(true);

    this.search$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => this.loadForeignKeyData(true, term))
      )
      .subscribe();
  }

  async loadForeignKeyData(reset = false, searchTerm = '') {
    if (this.loading) return;

    this.loading = true;
    if (reset) this.offset = 0;

    const foreignKey = this.column?.constraints?.foreignKey;
    if (!foreignKey) return;

    const { foreignTable, foreignColumn } = foreignKey;

    try {
      const filter: FilterCondition = searchTerm
        ? { column: foreignColumn, operator: 'LIKE', value: searchTerm }
        : null;

      this.tableService
        .getRows(this.sourceType, this.sourceId, foreignTable, {
          filterBy: filter ? [filter] : [],
          offset: this.offset,
          limit: 15,
        })
        .subscribe((response) => {
          const data = response.rows.map((row) => row[foreignColumn]);

          this.foreignKeyData = reset
            ? data
            : [...this.foreignKeyData, ...data];
          this.offset += response.rows.length;
        });
    } catch (error) {
      console.error('Error fetching foreign key data', error);
    } finally {
      this.loading = false;
    }
  }

  onScroll() {
    console.log('scroll');

    this.loadForeignKeyData();
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.search$.next(this.searchTerm);
  }

  onSelect(value: any) {
    this.valueChange.emit(value);
  }
}
