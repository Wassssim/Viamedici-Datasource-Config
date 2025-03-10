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
  host: string;
  port: number;
}

export type Config = MSSLConfig | PostgresConfig | ElasticsearchConfig | null;

export interface DataSourceConfig {
  selectedSource: DataSource;
  sourcesConfig: Record<DataSource, Config>;
}
