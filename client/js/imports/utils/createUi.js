export default function createUI(context) {
  // Create a container div for the UI
  const uiContainer = document.createElement('div');
  uiContainer.style.position = 'fixed';
  uiContainer.style.top = '0';
  uiContainer.style.left = '0';
  uiContainer.style.width = '100%';
  uiContainer.style.height = '50px';
  uiContainer.style.zIndex = '1000'; // Ensure it stays above the game canvas
  uiContainer.style.display = 'flex';
  uiContainer.style.alignItems = 'center';
  uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // Set initial opacity here
  uiContainer.style.paddingLeft = '20px';
  document.body.appendChild(uiContainer);

  const padding = 20; // Padding between text elements
  let xPosition = padding;

  // Create and style the text elements for UI
  context.playerRest = createTextElement(uiContainer, xPosition, ''); // Placeholder for rest text
  xPosition += 150;
  context.stamina = 100;
  context.staminaText = createTextElement(uiContainer, xPosition, `Stamina: ${context.stamina}`);
  xPosition += 200;
  context.collectedLogs = 0;
  context.collectedLogText = createTextElement(uiContainer, xPosition, `Collected Logs: ${context.collectedLogs}`);
  xPosition += 200;
  context.logCollectable = 0;
  context.logCollectableText = createTextElement(uiContainer, xPosition, `Dropped Woods: ${context.logCollectable}`);
  xPosition += 200;
  context.level = 1;
  context.levelText = createTextElement(uiContainer, xPosition, `Level: ${context.level}`);
  xPosition += 200;
  context.inventory = [];
  context.coin = 0;
  context.coinText = createTextElement(uiContainer, xPosition, `Coins: ${context.coin}`);

  // Create farming button
  createFarmingButton(context);

  // Scale UI based on camera zoom
  const scaleUI = () => {
    const zoom = context.cameras.main.zoom;
    const fontSize = 16 / zoom; // Adjust font size based on zoom level

    // Update text size based on zoom level
    updateTextSize(context.playerRest, fontSize);
    updateTextSize(context.staminaText, fontSize);
    updateTextSize(context.collectedLogText, fontSize);
    updateTextSize(context.logCollectableText, fontSize);
    updateTextSize(context.levelText, fontSize);
    updateTextSize(context.coinText, fontSize);
  };

  // Call scaleUI initially to adjust size based on the initial zoom level
  scaleUI();

  // Update UI scaling when zoom changes
  context.cameras.main.on('zoomchange', scaleUI);

  // Function to update UI values and log in real time
  const updateUIValues = () => {
    context.staminaText.textContent = `Stamina: ${context.stamina}`;
    context.collectedLogText.textContent = `Collected Logs: ${context.logCollectable}`;
    context.logCollectableText.textContent = `Dropped Woods: ${context.collectedLogs}`;
    context.levelText.textContent = `Level: ${context.level}`;
    context.coinText.textContent = `Coins: ${context.coin}`;
  };



  // Call update and log function periodically or when values change
  setInterval(() => {
    updateUIValues(); // Update the UI elements in real time
  }, 1000); // Adjust interval as needed (1 second in this case)
}

// Helper function to create text elements in HTML
function createTextElement(parent, xPosition, textContent) {
  const span = document.createElement('span');
  span.textContent = textContent;
  span.style.fontSize = '16px';
  span.style.color = '#fff';
  span.style.marginRight = '20px';
  parent.appendChild(span);
  return span;
}

// Helper function to update text size
function updateTextSize(element, fontSize) {
  element.style.fontSize = `${fontSize}px`;
}

// Farming button functionality
function createFarmingButton(context) {
  const button = document.createElement('button');
  button.innerText = 'Start Farming';
  button.style.position = 'absolute';
  button.style.top = '10px';
  button.style.left = '10px';
  button.style.padding = '10px 15px';
  button.style.fontSize = '16px';
  button.style.backgroundColor = '#000';
  button.style.color = '#fff';
  button.style.border = 'none';
  button.style.cursor = 'pointer';
  button.style.zIndex = '1001'; // Ensure the button is above the game canvas
  document.body.appendChild(button);

  button.addEventListener('click', () => {
    if (context.isAutomated) {
      console.log('Farming stopped!');
      context.isAutomated = false;
      button.innerText = 'Start Farming';
      context.moveToTree?.(); // Ensure moveToTree is defined before calling
    } else {
      console.log('Farming started!');
      context.isAutomated = true;
      button.innerText = 'Stop Farming';
    }
  });
}

export { createFarmingButton };
