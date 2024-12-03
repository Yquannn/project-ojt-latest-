import MyGame from "./js/imports/MyGame.js";

const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 600,
  parent: "game-container",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: MyGame,
  worldBounds: {
    x: 0,
    y: 0,
    width: 1200,
    height: 600,
  },
};

const game = new Phaser.Game(config);

