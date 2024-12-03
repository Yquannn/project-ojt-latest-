export function setupPlayer(scene, collisionMap) {
  const player = scene.physics.add.sprite(0, 0, "player");
  player.setSize(scene.tileSize, scene.tileSize);
  player.setCollideWorldBounds(true);

  scene.physics.add.collider(player, scene.boundaries);

  const cursors = scene.input.keyboard.createCursorKeys();

  return { player, cursors };
}

export function setupCamera(scene) {
  // Make sure background is set up first before accessing displayWidth and displayHeight
  scene.background = scene.add.image(
    scene.cameras.main.width / 2,
    scene.cameras.main.height / 2,
    "background"
  );
  scene.background.setOrigin(0.5, 0.5);
  scene.background.setScale(
    scene.cameras.main.width / scene.background.width,
    scene.cameras.main.height / scene.background.height
  );

  // Set camera bounds based on background size
  scene.cameras.main.setBounds(
    0,
    0,
    scene.background.displayWidth,
    scene.background.displayHeight
  );
  scene.cameras.main.startFollow(scene.player);
}
