export function startingPosition(area) {
  const validPositions = [];
  area.forEach((row, rowIndex) => {
    row.forEach((symbol, colIndex) => {
      if (symbol !== 4098) { // Not an obstacle
        validPositions.push({ x: colIndex, y: rowIndex });
      }
    });
  });
  return validPositions[
    Math.floor(Math.random() * validPositions.length)
  ];
}
