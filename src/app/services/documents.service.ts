import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DocumentsService {
  private apiUrl = 'http://localhost:4500/api';

  constructor(private http: HttpClient) {}

  // Fetch all available indices
  getIndices(sourceId: number): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.apiUrl}/documents/${sourceId}/indices`
    );
  }

  getSchema(sourceId: number, index: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/documents/${sourceId}/${index}/schema`
    );
  }

  // Fetch documents from a specific index
  getDocuments(
    sourceId: number,
    index: string,
    searchString?: string,
    fields?: string[],
    page = 1,
    pageSize = 10
  ): Observable<any[]> {
    const params = searchString ? { searchString } : {};

    if (fields && fields.length > 0) {
      params['fields'] = fields.join(','); // Convert array to comma-separated string
    }

    return this.http.get<any[]>(
      `${this.apiUrl}/documents/${sourceId}/${index}`,
      {
        params: { ...params, page, pageSize },
      }
    );
  }

  getDocument(
    sourceId: number,
    index: string,
    documentId: string,
    truncate = false
  ): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/documents/${sourceId}/${index}/${documentId}`,
      { params: { truncate: truncate ? '1' : '0' } }
    );
  }

  // Add a new document
  addDocument(sourceId: number, index: string, document: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/documents/${sourceId}/${index}`,
      document
    );
  }

  // Update a document
  updateDocument(
    sourceId: number,
    index: string,
    docId: string,
    updatedData: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/documents/${sourceId}/${index}/${docId}`,
      updatedData
    );
  }

  // Delete a document
  deleteDocument(
    sourceId: number,
    index: string,
    docId: string
  ): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/documents/${sourceId}/${index}/${docId}`
    );
  }
}
