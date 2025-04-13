import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Column, GetRowsOptions } from '../models/table.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TableService {
  private apiUrl = environment.apiUrl;
  selectedTableSubject = new BehaviorSubject<string>('');
  selectedTable$ = this.selectedTableSubject.asObservable();

  constructor(private http: HttpClient) {}

  getTables(sourceType: string, sourceId) {
    return this.http.get<any>(
      `${this.apiUrl}/tables/${sourceType}/${sourceId}`
    );
  }

  getTableStructure(sourceType: string, sourceId, table: string) {
    return this.http.get<{ columns: Column[] }>(
      `${this.apiUrl}/tables/${sourceType}/${sourceId}/${table}/structure`
    );
  }

  // Get rows for a specific table
  getRows(
    sourceType: string,
    sourceId,
    table: string,
    options?: GetRowsOptions
  ): Observable<any> {
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

    return this.http.get<any>(
      `${this.apiUrl}/tables/${sourceType}/${sourceId}/${table}/rows`,
      {
        params,
      }
    );
  }

  insertRow(sourceType: string, sourceId, table: string, row: any) {
    return this.http.post<any>(
      `${this.apiUrl}/tables/${sourceType}/${sourceId}/${table}/rows`,
      row
    );
  }
  // Update a row in the table
  updateRow(sourceType: string, sourceId, table: string, row: any, id: string) {
    return this.http.patch(
      `${this.apiUrl}/tables/${sourceType}/${sourceId}/${table}/rows/${id}`,
      row
    );
  }

  // Update a row based on arbitrary where condition
  updateRowWhere(
    sourceType: string,
    sourceId: number,
    table: string,
    where: Record<string, any>,
    values: Record<string, any>
  ) {
    return this.http.patch<any>(
      `${this.apiUrl}/tables/${sourceType}/${sourceId}/${table}/rows`,
      { where, values }
    );
  }

  // Delete a row from the table
  deleteRow(sourceType: string, sourceId, table: string, rowId: number) {
    return this.http.delete(
      `${this.apiUrl}/tables/${sourceType}/${sourceId}/${table}/rows/${rowId}`
    );
  }

  // Preprocess row data based on column types before sending it to the backend
  preprocessRowData(row: Record<string, any>, columns: any[]) {
    const transformedData = {};

    Object.keys(row).forEach((key) => {
      const value = row[key];
      if (!value || value === '') return;

      const columnType = columns.find((col) => col.name === key)?.type;

      switch (columnType) {
        case 'number':
          transformedData[key] = parseFloat(value);
          break;
        case 'boolean':
          transformedData[key] = value === true || value === 'true'; // Convert checkbox to boolean
          break;
        case 'datetime':
        case 'date':
          transformedData[key] = new Date(value).toISOString(); // Convert datetime-local to ISO string
          break;
        case 'string':
        default:
          transformedData[key] = value.toString();
      }
    });

    return transformedData;
  }
}
