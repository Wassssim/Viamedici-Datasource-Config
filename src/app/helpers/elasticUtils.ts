function isArray(value: any): boolean {
  return Array.isArray(value);
}

function isObject(value: any): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseSchema(schema: Record<string, any>): any {
  const res: Record<string, any> = {};
  Object.entries(schema).forEach(([key, value]) => {
    if (isObject(value)) {
      res[key] = parseSchema(value);
    } else if (isArray(value)) {
      res[key] = value.length > 0 ? [parseSchema(value[0])] : []; // Handle nested objects recursively
    } else {
      res[key] = getDefaultValueForType(value); // Set default value based on type
    }
  });
  return res;
}

function getDefaultValueForType(type: string) {
  switch (type) {
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'string':
      return '';
    case 'array':
      return []; // New case for arrays
    default:
      return ''; // Default fallback for unknown types
  }
}

export function getElasticsearchMappingKeys(
  obj: any,
  prefix = '',
  depth = 0
): string[] {
  let keys: string[] = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      keys.push(fullKey);

      if (typeof obj[key] === 'object' && obj[key] !== null) {
        keys = keys.concat(
          getElasticsearchMappingKeys(
            isArray(obj[key]) && obj[key].length > 0 ? obj[key][0] : obj[key],
            fullKey,
            depth + 1
          )
        );
      }
    }
  }

  return keys;
}
