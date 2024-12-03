// utils/obstacleUtils.js
export function createObstacles(scene, collisionMap) {
  const tileSize = scene.tileSize;

  for (let row = 0; row < collisionMap.length; row++) {
    for (let col = 0; col < collisionMap[row].length; col++) {
      const tile = collisionMap[row][col];
      if (tile === 4098) { // Obstacle tile
        // Create an obstacle at the specified position
        scene.add.image(col * tileSize + tileSize / 2, row * tileSize + tileSize / 2, "obstacle");

        // Add to boundaries set to prevent movement
        scene.boundaries.add(`${col},${row}`);
      }
    }
  }
}
