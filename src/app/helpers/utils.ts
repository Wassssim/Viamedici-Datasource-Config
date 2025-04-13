import { FormGroup } from '@angular/forms';

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

export function getChangedFields(
  form: FormGroup,
  originalData: { [key: string]: any }
) {
  const rawForm = form.getRawValue();
  const changes: { [key: string]: any } = {};

  Object.keys(form.controls).forEach((key) => {
    const control = form.get(key);
    const newValue = rawForm[key];
    const oldValue = originalData[key];

    if (control?.dirty && newValue !== oldValue) {
      changes[key] = newValue;
    }
  });

  return changes;
}
