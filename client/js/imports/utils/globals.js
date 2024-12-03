// globals.js
export let playerName = 'Player1';
export let playerRole = ''; // Variable to store the player's chosen role
export let roomId = ''; // Variable to store the room ID

// Role capacity
export const roleCapacity = {
    Miner: 5,
    Woodcutter: 5,
    Merchant: 5,
    Hunter: 5,
    Builder: 5
};

// Role count to track how many players are assigned to each role
export const roleCount = {
    Miner: 0,
    Woodcutter: 0,
    Merchant: 0,
    Hunter: 0,
    Builder: 0
};

// Generate a new room ID (this is a placeholder function; implement your logic)
export function generateRoomId() {
    return Math.random().toString(36).substr(2, 9); // Example: generates a random 9-character room ID
}
