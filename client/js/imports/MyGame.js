import { createPlayerAnimations } from "./animation/playerAnimation.js";
import findShortestPath from "../imports/controllers/pathFindings.js";
import { Vec2 } from './controllers/linAlg.js';
import createUI from './utils/createUi.js';
import { createFarmingButton } from "./utils/createUi.js";

class MyGame extends Phaser.Scene {
  constructor() {
    super({ key: "MyGame" });
    this.boundaries = new Set(); // Set to hold non-walkable tiles
    this.tileSize = 12; // Tile size in pixels
    this.path = []; // To store the calculated path
    this.currentPathIndex = 0; // To track current position in the path
    this.isMoving = false;
    this.speed = 40;
    this.chopping = false; // To prevent multiple chopping processes
    this.chopTimer = null; // To manage the timer
    this.timerText = null; // To display the timer
    this.isAutomated = false;
    this.trees = []; // To hold references to tree objects
    this.isFarming = false; // Farming flag
    this.colledtedLogs = 0
    this.coins = 0
  }

  preload() {
    this.load.image("background", "assets/OJT GAME MAP.png");
    this.load.spritesheet("player", "assets/Player.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("tree", "assets/spr_deco_tree_01_strip4.png", {
      frameWidth: 32, // Width of each frame
      frameHeight: 32, // Height of each frame
    });
    this.load.spritesheet("tree2", "assets/spr_deco_tree_01_strip4.png", {
      frameWidth: 36, // Width of each frame
      frameHeight: 30, // Height of each frame
    });
    this.load.image("obstacle", "assets/Obstacle.png");
    this.load.image("tree", "assets/tree.png");
    this.load.image('customCursor', 'assets/cursor_01.png'); // Replace with the correct path
  }

  create() {
    this.input.setDefaultCursor('url(assets/cursor_01.png), pointer'); // Set custom cursor

    this.trees = this.add.group();
    const baseScale = 1;
    const tilePixelSize = this.tileSize;
    const displaySize = 12.5;

    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;

    const Field1OffsetX = 6;
    const Field1OffsetY = 6;
    const Field2OffsetX = 6;
    const Field2OffsetY = 6;
    const Field3OffsetX = 6;
    const Field3OffsetY = 6;
    const Field4OffsetX = 6;
    const Field4OffsetY = 6;

    const calculatePosition = (index, tileSize, offset) => {
      return index * tileSize * baseScale + offset;
    };

    // Background setup
    this.background = this.add.image(gameWidth / 2, gameHeight / 2, "background");
    this.background.setOrigin(0.5, 0.5);
    this.background.setScale(gameWidth / this.background.width, gameHeight / this.background.height);

    createPlayerAnimations(this); // Initialize animations

    // Prepare collision and starting areas
    const rowLength = 100; // Length of a row in the collision data
    const collisionMap = [];
    const beginningArea = [];

    for (let i = 0; i < PlayerStartingPosition.length; i += rowLength) {
      beginningArea.push(PlayerStartingPosition.slice(i, i + rowLength));
    }
    const centerX = (rowLength * tilePixelSize) / 2;
    const centerY = (beginningArea.length * tilePixelSize) / 2;
    this.player = this.physics.add.sprite(centerX, centerY, "player");

    for (let i = 0; i < collision.length; i += rowLength) {
      collisionMap.push(collision.slice(i, i + rowLength));
    }

    // Create obstacles for collision map
    this.createObstacles(collisionMap);

    // Player setup at the center


    this.player.setSize(this.tileSize, this.tileSize);
    this.player.setOffset(10, 0);
    const scaleFactor = 0.9;
    this.player.setScale(scaleFactor);
    this.player.setCollideWorldBounds(true);

    // Collision between player and boundaries
    this.physics.add.collider(this.player, this.boundaries);

    // Camera setup
    this.cameras.main.setBounds(0, 0, this.background.displayWidth, this.background.displayHeight);
    this.cameras.main.startFollow(this.player);

    // Input handling for pathfinding
    this.input.on("pointerdown", (pointer) => {
      const target = this.getClickedPosition(pointer);
      const start = new Vec2(
        Math.floor(this.player.x / this.tileSize),
        Math.floor(this.player.y / this.tileSize)
      );
  
      // Find the shortest path using A* algorithm
      this.path = findShortestPath(start, target, this.boundaries);
      this.currentPathIndex = 0;
      this.isMoving = this.path && this.path.length > 0;
  
      console.log(this.isMoving ? "Path found!" : "No path found");
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    // Tree Spawner and resource events
    this.anims.create({
      key: "treeSwing",
      frames: this.anims.generateFrameNumbers("tree", { start: 0, end: 3 }),
      frameRate: 6, // Animation speed
      repeat: -1, // Loop the animation infinitely
    });

    this.treeGroup = this.physics.add.staticGroup();
    this.trees = [];
    const maxTrees = 150;
    let currentTreeCount = 0;

    const treeImages = ["tree"];
    const treeMargin = 20;
    const maxAttempts = 100;

    const offsets = [
      { offsetX: Field1OffsetX, offsetY: Field1OffsetY },
      { offsetX: Field2OffsetX, offsetY: Field2OffsetY },
      { offsetX: Field3OffsetX, offsetY: Field3OffsetY },
      { offsetX: Field4OffsetX, offsetY: Field4OffsetY },
    ];

    [Field1, Field2, Field3, Field4].forEach((field, fieldIndex) => {
      const offsetX = offsets[fieldIndex].offsetX;
      const offsetY = offsets[fieldIndex].offsetY;
      const fieldEvent = [];
      for (let i = 0; i < field.length; i += rowLength) {
        fieldEvent.push(field.slice(i, i + rowLength));
      }

      fieldEvent.forEach((row, rowIndex) => {
        row.forEach((symbol, colIndex) => {
          if (symbol === 4098 && currentTreeCount < maxTrees) {
            if (Math.random() < 0.5) {
              let isPositionValid = false;
              let attempts = maxAttempts;
              let randomX, randomY;

              // Validate tree placement to avoid overlap
              do {
                randomX = calculatePosition(colIndex, tilePixelSize, offsetX);
                randomY = calculatePosition(rowIndex, tilePixelSize, offsetY);

                isPositionValid = this.trees.every((tree) => {
                  const distance = Phaser.Math.Distance.Between(randomX, randomY, tree.x, tree.y);
                  return distance >= treeMargin;
                });

                attempts--;
              } while (!isPositionValid && attempts > 0);

              if (isPositionValid) {
                const randomTreeImage = Phaser.Utils.Array.GetRandom(treeImages);

                const tree = this.treeGroup.create(randomX, randomY, randomTreeImage);
                tree.play("treeSwing");

                tree.setSize(tilePixelSize * 2, tilePixelSize * 3);
                tree.setDisplaySize(displaySize * 2, displaySize * 3);

                tree.setInteractive();

                this.trees.push(tree);
                currentTreeCount++;
              }
            }
          }
        });
      });
    });

    // Start Farming button
    createFarmingButton(this)

    this.findNearestTree = function () {
      if (this.trees.length === 0) return null;
      let nearestTree = null;
      let minDistance = Infinity;
  
      this.trees.forEach(tree => {
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, tree.x, tree.y);
        if (distance < minDistance) {
          minDistance = distance;
          nearestTree = tree;
        }
      });
  
      return nearestTree;
    }

    createUI(this); // Call UI creation function



  }

 

  getClickedPosition(pointer) {
    const x = Math.floor(pointer.worldX / this.tileSize);
    const y = Math.floor(pointer.worldY / this.tileSize);
    return new Vec2(x, y);
  }

  createObstacles(area) {
    area.forEach((row, rowIndex) => {
      row.forEach((symbol, colIndex) => {
        if (symbol === 4098) { // Boundary symbol for obstacles
          const boundaryX = colIndex * this.tileSize + this.tileSize / 2;
          const boundaryY = rowIndex * this.tileSize + this.tileSize / 2;
          const obstacle = this.physics.add.staticImage(
            boundaryX,
            boundaryY,
            "obstacle"
          );
          obstacle.setDisplaySize(this.tileSize, this.tileSize);
          obstacle.setVisible(false);

          // Add the position to boundaries for pathfinding
          this.boundaries.add(`${colIndex},${rowIndex}`);
        }
      });
    });
  }


  moveToTree(treeX, treeY) {
    const start = new Vec2(
      Math.floor(this.player.x / this.tileSize),
      Math.floor(this.player.y / this.tileSize)
    );
  
    const target = new Vec2(
      Math.floor(treeX / this.tileSize),
      Math.floor(treeY / this.tileSize)
    );
  
    this.path = findShortestPath(start, target, this.boundaries);
  
    if (this.path && this.path.length > 0) {
      this.currentPathIndex = 0; // Start moving along the path
      this.isMoving = true;
      console.log("Path to tree found!");
    } else {
      console.log("No valid path to the tree.");
    }
  }
  

  startChoppingTree(tree) {
    if (this.chopping) return; // Prevent multiple chop calls

    this.chopping = true; // Set chopping state to true
    this.player.anims.play('chop'); // Play the chopping animation

    // Initialize the timer text
    this.cutTimerText = this.add.text(10, 10, 'Chopping: ', {
      fontSize: '12px',
      fill: '#fff',
    });

    let choppingDuration = 8000; // 8 seconds
    let elapsedTime = 0; // Time elapsed in milliseconds

    // Update the timer every second
    this.chopTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        elapsedTime += 1000;
        const remainingTime = Math.ceil((choppingDuration - elapsedTime) / 1000);
        this.cutTimerText.setText(`Chopping: ${remainingTime}s`);

        // Stop the timer if time's up
        if (elapsedTime >= choppingDuration) {
          this.chopTimer.remove(); // Remove timer event
          this.chopTimer = null; // Clear the timer reference
          this.finishChopping(tree); // Finish chopping the tree
        }
      },
      callbackScope: this,
      loop: true,
    });
  }

  finishChopping(tree) {
    this.chopping = false; // Reset chopping state
    this.player.anims.stop(); // Stop chopping animation
    this.cutTimerText.destroy(); // Remove timer text

    // Logic to handle tree chopping, e.g., removing tree
    const index = this.trees.indexOf(tree);
    if (index > -1) {
      this.trees.splice(index, 1); // Remove the chopped tree from the array
      tree.destroy(); // Remove tree from the scene
      this.logCollectable += 1

      if (this.speed >= 10) {
        this.speed -= 2
      }
      console.log(this.logCollectable)
    }

    // After chopping, find and move to the nearest tree
    const nearestTree = this.findNearestTree();
    if (nearestTree) {
      this.moveToTree(nearestTree.x, nearestTree.y);
    }
  }
  
  update() {

// In the 'create' method or scene setup
this.zoomInKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A); // Zoom in
this.zoomOutKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D); // Zoom out

if (this.input.keyboard.checkDown(this.zoomInKey, 100)) {
  this.cameras.main.zoom += 0.1; // Zoom in
}
if (this.input.keyboard.checkDown(this.zoomOutKey, 100)) {
  this.cameras.main.zoom -= 0.1; // Zoom out
}

// Always clamp zoom to prevent extreme values
this.cameras.main.zoom = Phaser.Math.Clamp(this.cameras.main.zoom, 0.5, 3);

    // Handle movement
    if (this.isMoving) {
      const targetPoint = this.path[this.currentPathIndex];
      const targetX = targetPoint.x * this.tileSize + this.tileSize / 2;
      const targetY = targetPoint.y * this.tileSize + this.tileSize / 2;
  
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, targetX, targetY);
      if (distance < 5) {
        this.currentPathIndex++;
        if (this.currentPathIndex >= this.path.length) {
          this.isMoving = false;
          this.player.setVelocity(0, 0); // Stop movement
          console.log("Arrived at the destination!");

        }
      } else {
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, targetX, targetY);
        this.player.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
  
        // Update the animation based on movement direction
        if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
          this.player.anims.play(Math.cos(angle) > 0 ? "walk-right" : "walk-left", true);
        } else {
          this.player.anims.play(Math.sin(angle) > 0 ? "walk-down" : "walk-up", true);
        }
      }
    } else {
      this.player.anims.stop(); // Stop animation if not moving
    }

    if (this.isAutomated){
      const nearestTree = this.findNearestTree();
      if (nearestTree) {
        const distanceToTree = Phaser.Math.Distance.Between(this.player.x, this.player.y, nearestTree.x, nearestTree.y);
        if (distanceToTree < 32 && !this.chopping) { // Check if the player is within 32 pixels
          this.startChoppingTree(nearestTree); // Start chopping the tree
        }
      }
    }
  }
  
  
}

export default MyGame;
