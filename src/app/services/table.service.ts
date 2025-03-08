import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { DataSource } from '../models/datasource-config.model';
import { GetRowsOptions } from '../models/table.model';

@Injectable({
  providedIn: 'root',
})
export class TableService {
  private apiUrl = 'http://localhost:4500/api'; // Your backend URL
  selectedTableSubject = new BehaviorSubject<string>('');
  selectedTable$ = this.selectedTableSubject.asObservable();

  constructor(private http: HttpClient) {}

  getTables(source: DataSource) {
    return this.http.get<any>(`${this.apiUrl}/tables?source=${source}`);
  }

  getTableStructure(table: string, source: DataSource) {
    return this.http.get<any>(
      `${this.apiUrl}/tables/${table}/structure/?source=${source}`
    );
  }

  // Get rows for a specific table
  getRows(table: string, options?: GetRowsOptions): Observable<any> {
    let params = new HttpParams();

    if (options?.filterBy) {
      options.filterBy.forEach((filter, index) => {
        params = params.set(`column[${index}]`, filter.column);
        params = params.set(`operator[${index}]`, filter.operator || '=');
        params = params.set(`value[${index}]`, filter.value.trim());
      });
    }

    if (options?.limit) params = params.set('limit', options.limit.toString());
    if (options?.offset)
      params = params.set('offset', options.offset.toString());
    if (options?.orderBy) {
      params = params.set('orderBy', options.orderBy);
      params = params.set('orderDirection', options.orderDirection || 'ASC');
    }

    console.log(params);

    return this.http.get<any>(`${this.apiUrl}/tables/${table}/rows`, {
      params,
    });
  }

  insertRow(table: string, row: any) {
    return this.http.post<any>(`${this.apiUrl}/tables/${table}/rows`, row);
  }
  // Update a row in the table
  updateRow(table: string, row: any) {
    return this.http.put(`${this.apiUrl}/tables/${table}/rows/${row.id}`, row);
  }

  // Delete a row from the table
  deleteRow(table: string, rowId: number) {
    return this.http.delete(`${this.apiUrl}/tables/${table}/rows/${rowId}`);
  }
}
