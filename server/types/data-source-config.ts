export enum DataSource {
  File = 'File',
  Postgres = 'Postgres',
  MSSQL = 'MSSQL',
  Elasticsearch = 'Elasticsearch',
}

type Table = { pattern: string };

export interface MSSLConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  tables: Table[];
}

export interface PostgresConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  tables: Table[];
}

export interface ElasticsearchConfig {
  protocol: string;
  host: string;
  port: number;
  indices: string[];
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
