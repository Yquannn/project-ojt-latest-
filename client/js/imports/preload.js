// GamePreload.js
export default class GamePreload extends Phaser.Scene {
  constructor() {
    super({ key: 'GamePreload' }); // Register the scene with a key
  }

  preload() {
    // Load images
    this.load.image("background", "assets/OJT GAME MAP.png");
    this.load.image("obstacle", "assets/Obstacle.png");
    this.load.image("tree", "assets/tree.png");

    // Load sprite sheets for player and trees
    this.load.spritesheet("player", "assets/Player.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.spritesheet("tree1", "assets/spr_deco_tree_01_strip4.png", {
      frameWidth: 32, // Width of each frame
      frameHeight: 32, // Height of each frame
    });

    this.load.spritesheet("tree2", "assets/spr_deco_tree_01_strip4.png", {
      frameWidth: 36, // Width of each frame
      frameHeight: 30, // Height of each frame
    });
  }

  create() {
    console.log("Assets preloaded!");
    // You can now start the next scene or add game elements
  }
}
