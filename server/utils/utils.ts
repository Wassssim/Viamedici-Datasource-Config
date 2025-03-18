export function truncateJSON(obj, maxLength) {
  try {
    const jsonString = JSON.stringify(obj, null, 4);
    return jsonString.length > maxLength
      ? jsonString.slice(0, maxLength) + '...'
      : jsonString;
  } catch (err) {
    console.error('Error serializing JSON:', err);
    return '{}'; // Return empty object on failure
  }
}
