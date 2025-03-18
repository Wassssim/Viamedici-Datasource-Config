import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DataSource,
  DataSourceConfig,
} from '../models/datasource-config.model';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private API_URL = 'http://localhost:4500/api/config'; // Backend URL
  // TODO: use a global config for apis

  constructor(private http: HttpClient) {}

  getConfig(): Observable<DataSourceConfig> {
    return this.http.get<DataSourceConfig>(this.API_URL);
  }

  getSourceTypes() {
    return this.http.get<{ sources: DataSource[] }>(
      this.API_URL + '/sources/types'
    );
  }

  getSources(sourceType: string) {
    return this.http.get<{ data: string[] }>(
      this.API_URL + '/sources/' + sourceType
    );
  }
}
