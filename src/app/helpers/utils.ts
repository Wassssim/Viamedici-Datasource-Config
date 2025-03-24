export function getKeys(obj: any, prefix = '', depth = 0): string[] {
  let keys: string[] = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      keys.push(fullKey);

      if (typeof obj[key] === 'object' && obj[key] !== null) {
        keys = keys.concat(getKeys(obj[key], fullKey, depth + 1));
      }
    }
  }

  return keys;
}

export function formatISODateForInput(isoString: string): string {
  const date = new Date(isoString);
  return date.toISOString().slice(0, 16); // Keep only "YYYY-MM-DDTHH:MM"
}
