export function splitArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export function calculatePosition(index, tileSize, offset) {
  return index * tileSize + offset;
}
