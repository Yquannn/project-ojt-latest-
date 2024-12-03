import { FarmingScene } from "./scenes/FarmingScene.js";
const socket = io('http://localhost:3000'); // Adjust to your server address

socket.on('connect', () => {
    console.log('Connected with socket ID:', socket.id);
});

let playerName = 'Player1';
let playerRole = '';
let roomId = '';

class BaseScene extends Phaser.Scene {
    constructor(sceneKey) {
        super({ key: sceneKey });
        this.htmlElements = [];
    }

    addHtmlElement(element) {
        this.htmlElements.push(element);
        document.body.appendChild(element);
    }

    cleanupHtmlElements() {
        this.htmlElements.forEach(element => element.remove());
        this.htmlElements = [];
    }

    shutdown() {
        this.cleanupHtmlElements();
    }
}

class MenuScene extends BaseScene {
    constructor() {
        super('MenuScene');
    }

    create() {
        this.add.text(window.innerWidth / 2, window.innerHeight / 4, 'Main Menu', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const createRoomText = this.add.text(window.innerWidth / 2, window.innerHeight / 3, 'Create Room', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5).setInteractive();

        createRoomText.on('pointerdown', () => {
            socket.emit('createRoom'); // Ask backend to create a new room
        });

        socket.on('roomJoined', (roomIdFromServer) => {
            roomId = roomIdFromServer; // Store the backend-generated Room ID
            console.log('Room created with ID:', roomId);
            this.scene.start('RoleScene');
        });

        const joinRoomText = this.add.text(window.innerWidth / 2, window.innerHeight / 2.5, 'Join Room', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5).setInteractive();

        joinRoomText.on('pointerdown', () => {
            this.scene.start('JoinRoomScene');
        });
    }
}

class JoinRoomScene extends BaseScene {
    constructor() {
        super('JoinRoomScene');
        this.playerCountText = null;
    }

    create() {
        this.add.text(window.innerWidth / 2, window.innerHeight / 4, 'Enter Room ID', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const roomInput = document.createElement('input');
        roomInput.type = 'text';
        roomInput.placeholder = 'Room ID';
        roomInput.style.position = 'absolute';
        roomInput.style.top = `${window.innerHeight / 2 - 8}px`;
        roomInput.style.left = `${window.innerWidth / 2 - 100}px`;
        this.addHtmlElement(roomInput);

        const joinButton = this.add.text(window.innerWidth / 2, window.innerHeight / 2, 'Join Room', {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();

        joinButton.on('pointerdown', () => {
            const roomId = roomInput.value.trim();
            if (roomId) {
                socket.emit('joinRoom', roomId);
            } else {
                alert('Please enter a Room ID');
            }
        });

        const backButton = this.add.text(30, 30, 'Back', {
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5).setInteractive();

        backButton.on('pointerdown', () => {
            this.cleanupHtmlElements();
            this.scene.start('MenuScene');
        });

        socket.on('roomJoined', (roomId) => {
            console.log(`Successfully joined room: ${roomId}`);
            this.cleanupHtmlElements();
            this.scene.start('RoleScene');
        });

        socket.on('updatePlayerCount', (playerCount) => {
            if (this.playerCountText) {
                this.playerCountText.destroy();
            }
            this.playerCountText = this.add.text(window.innerWidth / 2, window.innerHeight / 1.5, `Players in Room: ${playerCount}`, {
                fontSize: '20px',
                color: '#ffffff'
            }).setOrigin(0.5);
        });

        socket.on('roomNotFound', (roomId) => {
            alert(`Room not found: ${roomId}`);
        });

        socket.on('playerLimitReached', () => {
            alert('This room is full. You cannot join.');
        });
    }
}

// Settings Scene Definition
class SettingsScene extends BaseScene {
    constructor() {
        super('SettingsScene');
    }

    create() {
        this.add.text(window.innerWidth / 2, window.innerHeight / 4, 'Settings', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const input = document.createElement('input');
        input.type = 'text';
        input.value = playerName;
        input.placeholder = 'Enter new username';
        input.style.position = 'absolute';
        input.style.top = `${window.innerHeight / 2 - 20}px`;
        input.style.left = `${window.innerWidth / 2 - 100}px`;
        this.addHtmlElement(input);

        const saveButton = this.add.text(window.innerWidth / 2, window.innerHeight / 1.5, 'Save', {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();

        saveButton.on('pointerdown', () => {
            playerName = input.value;
            alert(`Username changed to: ${playerName}`);
            this.cleanupHtmlElements();
            this.scene.start('MenuScene');
        });
    }
}

class RoleScene extends BaseScene {
    constructor() {
        super('RoleScene');
    }

    create() {
        this.add.text(window.innerWidth / 2, window.innerHeight / 4, 'Choose Your Role', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const roleSelect = document.createElement('select');
        roleSelect.style.position = 'absolute';
        roleSelect.style.top = `${window.innerHeight / 2 - 20}px`;
        roleSelect.style.left = `${window.innerWidth / 2 - 50}px`;
        this.addHtmlElement(roleSelect);

        const roles = ['Miner', 'Woodcutter'];
        roles.forEach(role => {
            const option = document.createElement('option');
            option.value = role;
            option.textContent = role;
            roleSelect.appendChild(option);
        });

        const confirmButton = this.add.text(window.innerWidth / 2, window.innerHeight / 1.5, 'Enter', {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();

        confirmButton.on('pointerdown', () => {
            playerRole = roleSelect.value;
            console.log('Player role selected:', playerRole);
            this.scene.start('FarmingScene');
            this.cleanupHtmlElements();
        });

        const backButton = this.add.text(30, 30, 'Back', {
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5).setInteractive();

        backButton.on('pointerdown', () => {
            this.cleanupHtmlElements();
            this.scene.start('MenuScene');
        });
    }
}


// Phaser Game Configuration
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: 1000,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: 0,
            debug: true,
        }
    },
    scene: [MenuScene, JoinRoomScene, RoleScene, FarmingScene, SettingsScene] 
};

const game = new Phaser.Game(config);

// Export necessary components and variables
export { FarmingScene, MenuScene, JoinRoomScene, SettingsScene, RoleScene, playerName, playerRole, roomId };
