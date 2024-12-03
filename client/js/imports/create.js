// gameCreate.js
import { createPlayerAnimations } from "./animation/playerAnimation.js";
import findShortestPath from "../imports/controllers/pathFindings.js";
import { Vec2 } from "./controllers/linAlg.js";

export default function createGameScene() {

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
    button.style.zIndex = "1000";
    document.body.appendChild(button);
    
    button.addEventListener("click", () => {
      if (this.isAutomated) {
        console.log("Farming stopped!");
        this.isAutomated = false;
        button.innerText = "Start Farming";
        this.moveToTree();

      } else {
        // if(Distance < 5){
        //   console.log("Please go to the farming area")
        // }else{
        console.log("Farming started!");
        this.isAutomated = true;
        button.innerText = "Stop Farming";
        // }

      }
    });

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
}
