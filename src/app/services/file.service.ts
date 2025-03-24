import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FileParserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPropertiesFileData(
    sourceId: string
  ): Observable<{ data: Record<string, string> }> {
    return this.http.get<{ data: Record<string, string> }>(
      `${this.apiUrl}/files/${sourceId}/parsed`
    );
  }

  updatePropertiesFileData(
    sourceId: string,
    data: Record<string, string>
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/files/${sourceId}`, { data });
  }
}
