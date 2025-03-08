export enum DataSource {
  File = 'File',
  Postgres = 'Postgres',
  MSSQL = 'MSSQL',
  Elasticsearch = 'Elasticsearch',
}

export interface MSSLConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface PostgresConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface ElasticsearchConfig {
  host: string;
  port: number;
}

export interface FileConfig {
  filePath: string;
}

type SourcesConfig = {
  [DataSource.File]: FileConfig;
  [DataSource.MSSQL]: MSSLConfig;
  [DataSource.Postgres]: PostgresConfig;
  [DataSource.Elasticsearch]: ElasticsearchConfig;
};

export class DataSourceConfig {
  selectedSource: DataSource;
  sourcesConfig: SourcesConfig;
}
