 // import createGameScene from './create.js';
// import gamePreload from './preload.js';
import { createPlayerAnimations } from "./animation/playerAnimation.js";
import findShortestPath from "../imports/controllers/pathFindings.js";
import { Vec2 } from './controllers/linAlg.js';
import HandlePlayerMovement from './controllers/handleAutomatedMovement.js';
import createUI from './utils/createUi.js';

class MyGame extends Phaser.Scene {
  constructor() {
    super({ key: "MyGame" });
    this.boundaries = new Set(); // Set to hold non-walkable tiles
    this.tileSize = 12; // Tile size in pixels
    this.path = []; // To store the calculated path
    this.currentPathIndex = 0; // To track current position in the path
    this.isMoving = false;
    this.speed = 40;
    this.chopping = false; // To prevent chopping while already chopping
    this.chopTimer = null; // To manage the timer
    this.timerText = null; // To display the timer
    this.isAutomated = false;
    this.trees = []; // To hold references to tree objects
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
    createUI(this);
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

  for (let i = 0; i < collision.length; i += rowLength) {
    collisionMap.push(collision.slice(i, i + rowLength));
  }

  // Create obstacles for collision map
  this.createObstacles(collisionMap);

  // Player setup at the center
  const centerX = (rowLength * tilePixelSize) / 2;
  const centerY = (beginningArea.length * tilePixelSize) / 2;
  this.player = this.physics.add.sprite(centerX, centerY, "player");

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

  const ResourceEvent = [];
  for (let i = 0; i < Field1.length; i += rowLength) {
    ResourceEvent.push(Field1.slice(i, i + rowLength));
  }
  for (let i = 0; i < Field2.length; i += rowLength) {
    ResourceEvent.push(Field2.slice(i, i + rowLength));
  }
  for (let i = 0; i < Field3.length; i += rowLength) {
    ResourceEvent.push(Field3.slice(i, i + rowLength));
  }
  for (let i = 0; i < Field4.length; i += rowLength) {
    ResourceEvent.push(Field4.slice(i, i + rowLength));
  }

  // Resource Spawner
  this.anims.create({
    key: "treeSwing",
    frames: this.anims.generateFrameNumbers("tree", { start: 0, end: 3 }),
    frameRate: 6, // Animation speed
    repeat: -1, // Loop the animation infinitely
  });

  this.treeGroup = this.physics.add.staticGroup();
  this.trees = []; // Array to store tree objects for later management
  const maxTrees = 150; // Adjust maximum number of trees
  let currentTreeCount = 0; // Counter to track the number of trees spawned

  const treeImages = ["tree"]; // Array of possible tree images
  const treeMargin = 20; // Reduce minimum distance between trees
  const maxAttempts = 100; // Max attempts to find a valid position

  const offsets = [
    { offsetX: Field1OffsetX, offsetY: Field1OffsetY },
    { offsetX: Field2OffsetX, offsetY: Field2OffsetY },
    { offsetX: Field3OffsetX, offsetY: Field3OffsetY },
    { offsetX: Field4OffsetX, offsetY: Field4OffsetY },
  ];

  // Iterate over each field and spawn trees
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
          if (Math.random() < 0.5) { // Increased spawn probability to 50%
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

            // If a valid position is found, create the tree
            if (isPositionValid) {
              const randomTreeImage = Phaser.Utils.Array.GetRandom(treeImages);

              const tree = this.treeGroup.create(randomX, randomY, randomTreeImage);
              tree.play("treeSwing"); // Play the tree animation

              tree.setSize(tilePixelSize * baseScale * 2, tilePixelSize * baseScale * 3);
              tree.setDisplaySize(displaySize * baseScale * 2, displaySize * baseScale * 3);

              tree.setInteractive();

              // Add the tree to the trees array
              this.trees.push(tree);
              currentTreeCount++; // Increment the tree count
            }
          }
        }
      });
    });
  });

  // New logic: Check if player is near tree and start chopping process
  this.physics.add.overlap(this.player, this.treeGroup, chopTree, null, this);

  // Helper variables to manage chopping state
  this.isChopping = false;
  this.choppingTree = null;
  this.isFarming = false;

  // Create a "Start Farming" button
  const button = document.createElement("button");
  button.innerText = "Start Farming";
  button.style.position = "absolute";
  button.style.top = "10px";
  button.style.left = "10px";
  button.style.padding = "10px 15px";
  button.style.fontSize = "16px";
  button.style.backgroundColor = "#000";
  button.style.color = "#fff";
  button.style.border = "none";
  button.style.cursor = "pointer";
  button.style.zIndex = "1000"; // Ensure it stays on top
  document.body.appendChild(button);

  // Add event listener to start farming automation when button is clicked
  button.addEventListener("click", () => {
    console.log("Farming started!");
    this.isFarming = true; // Enable farming mode
    chopTree.call(this); // Start automating farming
  });
  

  

  function chopTree(player, tree) {
    if (this.isChopping) return; // Prevent multiple chopping processes

    this.isChopping = true;
    this.choppingTree = tree;

    console.log("Started chopping the tree!");
    const chopDuration = 7000; // 7 seconds

    // Create a progress text above the tree
    const progressText = this.add.text(tree.x, tree.y - 20, "Chopping...", {
      fontSize: "16px",
      color: "#ffffff",
    });

    // Set a timer to remove the tree after 7 seconds
    this.time.delayedCall(chopDuration, () => {
      console.log("Tree chopped down!");
      this.isChopping = false;
      this.choppingTree = null;

      // Remove the tree and progress text
      tree.destroy();
      progressText.destroy();

      // Optionally add resources to the player
      console.log("Resources collected!");
    });
  }
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

  getClickedPosition(pointer) {
    const x = Math.floor(pointer.worldX / this.tileSize);
    const y = Math.floor(pointer.worldY / this.tileSize);
    return new Vec2(x, y);
  }

  findNearestTree() {
    let nearestTree = null;
    let minDistance = Number.MAX_VALUE;
    this.trees.forEach((tree) => {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, tree.x, tree.y);
      if (distance < minDistance) {
        minDistance = distance;
        nearestTree = tree;
      }
    });
    return nearestTree;
  }

  // Function to move the player to the nearest tree
  moveToNearestTree() {
    const nearestTree = this.findNearestTree();
    if (nearestTree) {
      const target = new Vec2(
        Math.floor(nearestTree.x / this.tileSize),
        Math.floor(nearestTree.y / this.tileSize)
      );
      const start = new Vec2(
        Math.floor(this.player.x / this.tileSize),
        Math.floor(this.player.y / this.tileSize)
      );

      this.path = findShortestPath(start, target, this.boundaries);
      this.currentPathIndex = 0;
      this.isMoving = this.path && this.path.length > 0;
      console.log("Moving to nearest tree...");
    } else {
      console.log("No trees available.");
    }
  }

  getClickedPosition(pointer) {
    const x = Math.floor(pointer.worldX / this.tileSize);
    const y = Math.floor(pointer.worldY / this.tileSize);
    return new Vec2(x, y);
  }

  update() {
    if (this.isAutomated) {
      HandlePlayerMovement(this); // Handle automated movement
    } else {
      if (this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A), 100)) {
        this.cameras.main.zoom += 0.1; // Zoom in
      }
      if (this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D), 100)) {
        this.cameras.main.zoom -= 0.1; // Zoom out
      }

      // Limit the zoom level
      this.cameras.main.zoom = Phaser.Math.Clamp(this.cameras.main.zoom, 0.5, 3);

      this.player.setVelocity(0, 0);

      if (this.isAutomated && this.isMoving) {
        const targetPoint = this.path[this.currentPathIndex];
        const targetX = targetPoint.x * this.tileSize + this.tileSize / 2;
        const targetY = targetPoint.y * this.tileSize + this.tileSize / 2;
  
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, targetX, targetY);
        if (distance < 5) {
          this.currentPathIndex++;
          if (this.currentPathIndex >= this.path.length) {
            this.isMoving = false;
            this.player.setVelocity(0, 0);
          }
        } else {
          const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, targetX, targetY);
          this.player.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
          );
        }
      }
    

      // Manual movement with keyboard input
      if (this.cursors.left.isDown) {
        this.movePlayer(-1, 0);
        this.player.anims.play("walk-left", true);
      } else if (this.cursors.right.isDown) {
        this.movePlayer(1, 0);
        this.player.anims.play("walk-right", true);
      } else if (this.cursors.up.isDown) {
        this.movePlayer(0, -1);
        this.player.anims.play("walk-up", true);
      } else if (this.cursors.down.isDown) {
        this.movePlayer(0, 1);
        this.player.anims.play("walk-down", true);
      } else if (this.isMoving && this.path.length > 0) {
        const targetPoint = this.path[this.currentPathIndex];
        const targetX = targetPoint.x * this.tileSize + this.tileSize / 2;
        const targetY = targetPoint.y * this.tileSize + this.tileSize / 2;

        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, targetX, targetY);

        if (distance < 5) {
          this.currentPathIndex++;
          if (this.currentPathIndex >= this.path.length) {
            this.isMoving = false;
            this.player.setVelocity(0, 0);
          }
        } else {
          const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, targetX, targetY);
          this.player.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
          );

          if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
            this.player.anims.play(Math.cos(angle) > 0 ? "walk-right" : "walk-left", true);
          } else {
            this.player.anims.play(Math.sin(angle) > 0 ? "walk-down" : "walk-up", true);
          }
        }
      } else {
        this.player.anims.stop();
      }
    }
  }

  movePlayer(dx, dy) {
    this.player.setVelocity(dx * this.speed, dy * this.speed);
  }
}

export default MyGame;