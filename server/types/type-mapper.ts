import { DataSource } from './data-source-config';

// prettier-ignore
// Normalized types map for rendering in frontend
const postgresSqlTypeMap: Record<string, string> = {
  // PostgreSQL types
  integer: 'number',                // 32-bit integer
  int: 'number',                    // Alias for integer
  bigint: 'number',                 // 64-bit integer
  smallint: 'number',               // 16-bit integer
  boolean: 'boolean',               // True/false values
  text: 'string',                   // Variable-length string
  varchar: 'string',                // Variable-length string with max length
  'character varying': 'string',    // Alias for varchar
  char: 'string',                   // Fixed-length string
  timestamp: 'datetime',                // Date and time
  'timestamp without time zone': 'datetime', // Date and time without timezone
  'timestamp with time zone': 'datetime',
  date: 'date',                     // Date only
  float: 'number',                  // Single precision floating-point number
  decimal: 'number',                // Exact numeric value
  numeric: 'number',                // Exact numeric value (same as decimal)
  jsonb: 'object',                  // JSON data (can be parsed as an object)
  json: 'object',                   // JSON data (can be parsed as an object)
  'double precision': 'number',       // Double precision floating-point number
  real: 'number',                   // Single precision floating-point number
  bytea: 'Buffer',                  // Binary data
  uuid: 'string',                   // Universally unique identifier
  inet: 'string',                   // IP address (IPv4 or IPv6)
  time: 'string',                   // Time without time zone
  'time without time zone': 'string', // Alias for time
  interval: 'object',               // Time interval (e.g., '1 day', '2 hours')
  'character': 'string',            // Fixed-length string (1 character)
  point: 'object',  // Geospatial point (x, y coordinates)
  line: 'string',                   // Geospatial line (represented as string)
  lseg: 'string',                   // Geospatial line segment (represented as string)
  box: 'string',                    // Geospatial box (represented as string)
  path: 'string',                   // Geospatial path (represented as string)
  polygon: 'string',                // Geospatial polygon (represented as string)
  circle: 'string',                 // Geospatial circle (represented as string)
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
  nested: 'any',
  object: 'any', // Generic object type
  binary: 'Buffer', // Binary data can be represented as a Buffer
  ip: 'string', // IP addresses are usually stored as strings
  geo_point: '{ lat: number; lon: number }', // Geo points
  geo_shape: 'any', // Can be further refined based on use case
  completion: 'string',
  token_count: 'number',
  percolator: 'string',
  flattened: 'any',
  search_as_you_type: 'string',
};

// Function to map Elasticsearch types to TypeScript types
export function mapElasticsearchType(type: string): string {
  return elasticsearchTypeMap[type] || 'any';
}

export function convertElasticsearchMappings(schema: any): any {
  return Object.entries(schema).reduce((acc, [key, value]: any) => {
    if (value.properties) {
      // Recursively map properties for nested objects
      acc[key] = convertElasticsearchMappings(value.properties);
    } else {
      acc[key] = mapElasticsearchType(value.type);
    }
    return acc;
  }, {} as Record<string, any>);
}

/**
 * Recursively flattens an Elasticsearch mapping and returns a mapping of field paths to TypeScript types.
 *
 * @param mapping - The Elasticsearch index mapping object.
 * @param parentKey - The parent key used for recursive calls (default is an empty string).
 * @returns A flattened object where keys are field paths and values are TypeScript types.
 *
 * @example
 * const mapping = {
 *   properties: {
 *     obj: {
 *       properties: {
 *         a: { type: 'long' },
 *         b: {
 *           properties: {
 *             nes: { type: 'long' },
 *             sted: {
 *               type: 'text',
 *               fields: {
 *                 keyword: { type: 'keyword' }
 *               }
 *             }
 *           }
 *         }
 *       }
 *     }
 *   }
 * };
 *
 * const flattened = flattenElasticsearchMapping(mapping);
 * console.log(flattened);
 * // Output:
 * // {
 * //   'obj.a': 'number',
 * //   'obj.b.nes': 'number',
 * //   'obj.b.sted': 'string',
 * //   'obj.b.sted.keyword': 'string'
 * // }
 */
export function flattenElasticsearchMapping(
  mapping: any,
  parentKey: string = ''
): Record<string, string> {
  const flattened: Record<string, string> = {};

  function recurse(properties: any, parent: string) {
    for (const key in properties) {
      if (properties.hasOwnProperty(key)) {
        const field = properties[key];
        const fieldPath = parent ? `${parent}.${key}` : key;

        if (field.type) {
          flattened[fieldPath] =
            field.type === 'nested'
              ? 'nested'
              : mapElasticsearchType(field.type);
        }

        if (field.properties) {
          recurse(field.properties, fieldPath);
        } else if (field.fields) {
          // Handle multi-fields
          for (const subField in field.fields) {
            const subFieldPath = `${fieldPath}.${subField}`;
            flattened[subFieldPath] = mapElasticsearchType(
              field.fields[subField].type
            );
          }
        }
      }
    }
  }

  if (mapping && mapping.properties) {
    recurse(mapping.properties, parentKey);
  }

  return flattened;
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
