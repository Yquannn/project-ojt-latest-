// pathfinding.js
import { Vec2 } from "./linAlg.js";

const manhattanDistance = (p1, p2) => Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);

const manhattanNeighbours = [
  new Vec2(0, 1),
  new Vec2(0, -1),
  new Vec2(1, 0),
  new Vec2(-1, 0)
];

/**
 * @param {Vec2} start Starting location
 * @param {Vec2} target Target location
 * @param {Set<string>} boundaries Set of boundaries, (string vec2 objects)
 * @returns {Vec2[] | null} The shortest manhattan path, null if it does not exist
 */
export default function findShortestPath(start, target, boundaries) {
  const heuristic = manhattanDistance;

  // Create a map to keep track of the cost of reaching each point
  const costMap = new Map();
  costMap.set(start.toString(), 0);

  // Create a map to keep track of the parent node for each point
  const parentMap = new Map();
  parentMap.set(start.toString(), start);

  // Create a priority queue to store candidate points
  const queue = [start];

  // Loop until we find the target or the queue is empty
  while (queue.length > 0) {
    // Get the point with the lowest estimated total cost
    const current = queue.shift();

    // If we've reached the target, reconstruct the path and return it
    if (current.equals(target)) {
      const path = [];
      let node = current;
      while (node && !node.equals(start)) {
        path.unshift(node);
        node = parentMap.get(node.toString());
      }
      path.unshift(start);
      return path;
    }

    // Check each adjacent point and add it to the queue if it's not blocked
    for (const direction of manhattanNeighbours) {
      const neighbor = current.add(direction);

      // Ensure the neighbor is not out of bounds and is not a blocked tile
      if (
        !boundaries.has(neighbor.toString()) &&  // Not an obstacle
        neighbor.x >= 0 && neighbor.y >= 0 &&    // Ensure it is within bounds
        (!costMap.has(neighbor.toString()) || costMap.get(current.toString()) + 1 < costMap.get(neighbor.toString()))
      ) {
        costMap.set(neighbor.toString(), costMap.get(current.toString()) + 1);
        parentMap.set(neighbor.toString(), current);
        const costEstimate = costMap.get(neighbor.toString()) + heuristic(neighbor, target);
        
        let i = 0;
        // Insert the neighbor in the queue according to its cost estimate
        while (i < queue.length && costEstimate > costMap.get(queue[i].toString()) + heuristic(queue[i], target)) {
          i++;
        }
        queue.splice(i, 0, neighbor);
      }
    }
  }

  // If we didn't find a path, return null
  return null;
}
