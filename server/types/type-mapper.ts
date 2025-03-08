import { DataSource } from './data-source-config';

// Normalized types map for rendering in frontend
const postgresSqlTypeMap: Record<string, string> = {
  // PostgreSQL types
  integer: 'number',
  int: 'number',
  bigint: 'number',
  smallint: 'number',
  boolean: 'boolean',
  text: 'string',
  varchar: 'string',
  char: 'string',
  timestamp: 'datetime',
  'timestamp without time zone': 'datetime',
  date: 'date',
  float: 'number',
  decimal: 'number',
};

const mssqlTypeMAp = {
  // MSSQL types
  int: 'number',
  bigint: 'number',
  smallint: 'number',
  bit: 'boolean',
  varchar: 'string',
  char: 'string',
  datetime: 'datetime',
  date: 'date',
  float: 'number',
  decimal: 'number',
  text: 'string',
  ntext: 'string',
  real: 'number',
};

export function mapType(
  type: string,
  sourceType: DataSource.Postgres | DataSource.MSSQL
) {
  let map;
  switch (sourceType) {
    case DataSource.Postgres:
      map = postgresSqlTypeMap;
      break;
    case DataSource.MSSQL:
      map = mssqlTypeMAp;
      break;
  }

  if (map && type in map) {
    return map[type];
  }

  return type;
}
