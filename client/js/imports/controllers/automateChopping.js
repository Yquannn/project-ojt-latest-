// import { Vec2 } from './LinAgl.js'; // Ensure this matches the path and file name
// import findShortestPath from "./PathFinding.js"; // Import your A* pathfinding logic



// function findNearestTree(scene) {
//   if (scene.trees.length === 0) return null;
//   let nearestTree = null;
//   let minDistance = Infinity;

//   scene.trees.forEach(tree => {
//     const distance = Phaser.Math.Distance.Between(scene.player.x, scene.player.y, tree.x, tree.y);
//     if (distance < minDistance) {
//       minDistance = distance;
//       nearestTree = tree;
//     }
//   });

//   return nearestTree;
// }

// function moveToTree(scene, treeX, treeY) {
//   const start = new Vec2(
//     Math.floor(scene.player.x / scene.tileSize),
//     Math.floor(scene.player.y / scene.tileSize)
//   );

//   const target = new Vec2(
//     Math.floor(treeX / scene.tileSize),
//     Math.floor(treeY / scene.tileSize) + 1
//   );

//   scene.path = findShortestPath(start, target, scene.boundaries);

//   if (scene.path) {
//     scene.currentPathIndex = 0; // Reset the path index to start moving
//   } else {
//     console.log("No path found to the tree.");
//   }
// }

// function startChoppingTree(scene, tree) {
//   if (scene.chopping) return;

//   scene.chopping = true;
//   scene.player.anims.play('chop');

//   scene.cutTimerText = scene.add.text(10, 10, 'Chopping: ', {
//     fontSize: '12px',
//     fill: '#fff',
//   });

//   let choppingDuration = 8000; // 8 seconds
//   let elapsedTime = 0;

//   scene.chopTimer = scene.time.addEvent({
//     delay: 1000,
//     callback: () => {
//       elapsedTime += 1000;
//       const remainingTime = Math.ceil((choppingDuration - elapsedTime) / 1000);
//       scene.cutTimerText.setText(`Chopping: ${remainingTime}s`);

//       if (elapsedTime >= choppingDuration) {
//         scene.chopTimer.remove();
//         scene.chopTimer = null;
//         finishChopping(scene, tree);
//       }
//     },
//     callbackScope: scene,
//     loop: true,
//   });
// }

// function finishChopping(scene, tree) {
//   scene.chopping = false;
//   scene.player.anims.stop();
//   scene.cutTimerText.destroy();

//   const index = scene.trees.indexOf(tree);
//   if (index > -1) {
//     scene.trees.splice(index, 1);
//     tree.destroy();
//   }

//   const nearestTree = findNearestTree(scene);
//   if (nearestTree) {
//     moveToTree(scene, nearestTree.x, nearestTree.y);
//   }
// }

// export {
//   createTrees,
//   findNearestTree,
//   moveToTree,
//   startChoppingTree,
//   finishChopping,
// };
