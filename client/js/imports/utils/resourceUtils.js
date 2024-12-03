export function setupResourceSpawner(scene, collisionMap) {
  const resources = scene.physics.add.staticGroup();

  collisionMap.forEach((row, rowIndex) => {
    row.forEach((symbol, colIndex) => {
      if (symbol === 4098) {
        const x = colIndex * scene.tileSize;
        const y = rowIndex * scene.tileSize;
        const resource = scene.physics.add.staticSprite(x, y, "tree");
        resources.add(resource);
      }
    });
  });

  scene.ResourceArea = resources;
}
