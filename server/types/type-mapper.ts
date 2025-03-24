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
