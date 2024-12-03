// Local variables for path and movement
let path = [];  // Path will be a local variable
let currentPathIndex = 0;  // To track the current position in the path

export function create() {
  this.tileSize = 32;  // Tile size in pixels
  this.boundaries = new Set(); // Set to hold non-walkable tiles

  // Player setup
  this.player = this.add.sprite(100, 100, 'player'); // Starting position for example

  // Input listener to calculate the path
  this.input.on('pointerdown', (pointer) => {
    const target = getClickedPosition(pointer, this.tileSize);
    // Assume findShortestPath is a function that calculates the path
    path = findShortestPath(new Vec2(Math.floor(this.player.x / this.tileSize), Math.floor(this.player.y / this.tileSize)), target, this.boundaries);
    currentPathIndex = 0;  // Reset the current index for new path

    // Optionally visualize the path
    visualizePath.call(this, path);
  });
}

export default function update() {
  // Ensure path is calculated and available
  if (path.length > 0 && currentPathIndex < path.length) {
    const targetPoint = path[currentPathIndex];

    // Move the player towards the target point
    this.player.x += (targetPoint.x * this.tileSize + this.tileSize / 2 - this.player.x) * 0.05;
    this.player.y += (targetPoint.y * this.tileSize + this.tileSize / 2 - this.player.y) * 0.05;

    // Check if the player has reached the target point
    if (Phaser.Math.Distance.Between(this.player.x, this.player.y, targetPoint.x * this.tileSize + this.tileSize / 2, targetPoint.y * this.tileSize + this.tileSize / 2) < 2) {
      currentPathIndex++; // Move to the next point in the path
    }
  }
}

// Helper Functions
function getClickedPosition(pointer, tilePixelSize) {
  const x = Math.floor(pointer.worldX / tilePixelSize);
  const y = Math.floor(pointer.worldY / tilePixelSize);
  return new Vec2(x, y);  // Return the target position as a Vec2
}

// Visualize the path (optional for debugging)
function visualizePath(path) {
  // path.forEach((point) => {
  //   const sprite = this.add.sprite(point.x * this.tileSize + this.tileSize / 2, point.y * this.tileSize + this.tileSize / 2, 'grass');
  //   sprite.setOrigin(0.5, 0.5);
  // });
}

// Sample pathfinding function (replace with your actual A* or pathfinding logic)
function findShortestPath(start, target, boundaries) {
  // Mock pathfinding logic (replace with real logic)
  // For simplicity, we'll just return a straight path from start to target
  return [start, target];
}
