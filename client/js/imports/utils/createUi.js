// import { playerName } from "./menu.js";
// import HandlePlayerMovement from './HandleMovement.js'; // Ensure this path is correct

export default function createUI(context) {
  // Add text for player name
  // context.playerName = context.add.text(context.cameras.main.width - 700, 16, `Player Name: ${playerName}`, {
  //   fontSize: '12px',
  //   fill: '#fff',
  //   align: 'right',
  // });

  // Player rest text
  context.playerRest = context.add.text(180, 180, '', {
    fontSize: '12px',
    fill: '#fff',
  });

  // Initialize stamina and display
  context.stamina = 20;
  context.defaultStamina = 100;
  context.staminaText = context.add.text(context.cameras.main.width - 500, 16, `Stamina: ${context.stamina}`, {
    fontSize: '12px',
    fill: '#fff',
    align: 'right',
  });

  // Initialize collected logs and display
  context.collectedLog = 0;
  context.collectedLogText = context.add.text(context.cameras.main.width - 300, 16, `Collected Logs: ${context.collectedLog}`, {
    fontSize: '12px',
    fill: '#fff',
    align: 'right',
  });

  // Initialize dropped logs and display
  context.logCollectable = 0;
  context.logCollectableText = context.add.text(context.cameras.main.width - 430, 16, `Dropped Woods: ${context.logCollectable}`, {
    fontSize: '12px',
    fill: '#fff',
    align: 'right',
  });

  // Initialize level and display
  context.level = 1.9;
  context.levelText = context.add.text(context.cameras.main.width - 150, 16, `Level: ${context.level}`, {
    fontSize: '12px',
    fill: '#fff',
    align: 'right',
  });

  // Initialize inventory and coins
  context.inventory = [];
  context.coin = 0;
  context.coinText = context.add.text(context.cameras.main.width - 70, 16, `Coins: ${context.coin}`, {
    fontSize: '12px',
    fill: '#fff',
    align: 'right',
  });

  // Create Automate button
  AutomatedMovement(context);

  // Initialize automation state
  context.isAutomated = false; // Start with automation off
}

function AutomatedMovement(context) {
  context.automateButton = context.add.text(20, 80, 'Automate', {
    fontSize: '16px',
    fill: '#0f0',
  })
  .setInteractive()
  .on('pointerdown', () => {
    context.isAutomated = !context.isAutomated; // Toggle automation state
    context.automateButton.setText(context.isAutomated ? 'Stop Automate' : 'Automate'); // Update button text
  });
}

export { AutomatedMovement };
