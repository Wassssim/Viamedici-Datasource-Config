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
  'character varying': 'string',
  char: 'string',
  timestamp: 'datetime',
  'timestamp without time zone': 'datetime',
  date: 'date',
  float: 'number',
  decimal: 'number',
  jsonb: 'json',
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

// Mapping Elasticsearch types to TypeScript types
const elasticsearchTypeMap: Record<string, string> = {
  long: 'number',
  integer: 'number',
  short: 'number',
  byte: 'number',
  double: 'number',
  float: 'number',
  half_float: 'number',
  scaled_float: 'number',
  boolean: 'boolean',
  keyword: 'string',
  text: 'string',
  date: 'Date', // Can be represented as Date object in TypeScript
  nested: 'Array<any>', // Nested objects usually hold an array of objects
  object: 'Record<string, any>', // Generic object type
  binary: 'Buffer', // Binary data can be represented as a Buffer
  ip: 'string', // IP addresses are usually stored as strings
  geo_point: '{ lat: number; lon: number }', // Geo points
  geo_shape: 'any', // Can be further refined based on use case
  completion: 'string',
  token_count: 'number',
  percolator: 'string',
  flattened: 'Record<string, any>',
  search_as_you_type: 'string',
};

// Function to map Elasticsearch types to TypeScript types
export function mapElasticsearchType(type: string): string {
  return elasticsearchTypeMap[type] || 'any';
}

export function convertElasticsearchSchema(schema: any): any {
  return Object.entries(schema).reduce((acc, [key, value]: any) => {
    if (value.properties) {
      // Recursively map properties for nested objects
      acc[key] = convertElasticsearchSchema(value.properties);
    } else {
      acc[key] = mapElasticsearchType(value.type);
    }
    return acc;
  }, {} as Record<string, any>);
}

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
