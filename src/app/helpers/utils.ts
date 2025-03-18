export function getKeys(obj: any, prefix = '', depth = 0): string[] {
  let keys: string[] = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      keys.push(fullKey);

      if (typeof obj[key] === 'object' && obj[key] !== null) {
        keys = keys.concat(
          getKeys(obj[key], depth === 0 ? '' : fullKey, depth + 1)
        );
      }
    }
  }

  return keys;
}
