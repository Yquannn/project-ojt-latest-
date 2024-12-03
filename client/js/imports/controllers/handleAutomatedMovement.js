

export default function HandlePlayerMovement(context) {
  if (context.path && context.currentPathIndex < context.path.length) {
      const nextPoint = context.path[context.currentPathIndex];
      const targetX = nextPoint.x * context.tileSize + context.tileSize / 2;
      const targetY = nextPoint.y * context.tileSize + context.tileSize / 2;

      const speed = 0.1; // Adjust this value to set the speed
      const distance = Phaser.Math.Distance.Between(context.player.x, context.player.y, targetX, targetY);

      if (distance > speed) {
          const angle = Phaser.Math.Angle.Between(context.player.x, context.player.y, targetX, targetY);
          context.player.x += Math.cos(angle) * speed;
          context.player.y += Math.sin(angle) * speed;

        //   context.playWalkAnimation(targetX, targetY);
      } else {
          context.player.setPosition(targetX, targetY); // Snap to target position
        //   context.playWalkAnimation(targetX, targetY);
          context.currentPathIndex++; // Move to the next point in the path
      }
  }
}
