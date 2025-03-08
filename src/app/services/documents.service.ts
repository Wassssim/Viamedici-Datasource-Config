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
  getIndices(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/documents/indices`);
  }

  // Fetch documents from a specific index
  getDocuments(index: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/documents/${index}`);
  }

  // Add a new document
  addDocument(index: string, document: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/documents/${index}`, document);
  }

  // Update a document
  updateDocument(
    index: string,
    docId: string,
    updatedData: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/documents/${index}/${docId}`,
      updatedData
    );
  }

  // Delete a document
  deleteDocument(index: string, docId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/documents/${index}/${docId}`);
  }
}
