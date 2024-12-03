export function createPlayerAnimations(scene) {
  scene.anims.create({
    key: 'walk-down',
    frames: scene.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  scene.anims.create({
    key: 'walk-left',
    frames: scene.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
    frameRate: 10,
    repeat: -1
  });

  scene.anims.create({
    key: 'walk-right',
    frames: scene.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
    frameRate: 10,
    repeat: -1
  });

  scene.anims.create({
    key: 'walk-up',
    frames: scene.anims.generateFrameNumbers('player', { start: 12, end: 15 }),
    frameRate: 10,
    repeat: -1
  });
}
