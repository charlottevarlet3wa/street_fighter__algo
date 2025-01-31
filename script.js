const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const keys = {};

class Game {
    constructor(){
        this.width = 400;
        this.height = 800;
    }
}

const game = new Game();

class Player {
    constructor(x, y, color, controls) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 100;
        this.color = color;
        this.health = 10;
        this.controls = controls;
        this.isCrouching = false;
        this.isJumping = false;
        this.jumpForce = 15;
        this.gravity = 1;
        this.velocityY = 0;
        this.groundY = y; // Initial y position (ground level)
        this.attackTimer = 0;
        this.attackType = '';
        this.highReach = 10;
        this.jumpingKeyPressed = false; // New variable to track if the jump key is pressed
        this.highAttackKeyPressed = false;
        this.lowAttackKeyPressed = false;
    }

    update() {
        if (this.isJumping) {
            this.velocityY -= this.gravity;
            this.y -= this.velocityY;
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.isJumping = false;
                this.velocityY = 0;
            }
        }
    }

    jump() {
        if (!this.isJumping && !this.isCrouching && !this.jumpingKeyPressed) {
            this.isJumping = true;
            this.velocityY = this.jumpForce;
            this.jumpingKeyPressed = true;
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        if (this.attackTimer > 0) {
            if (this.attackType === 'high') {
                ctx.fillRect(this.x + (this.controls.left === 'ArrowLeft' ? -20 : this.width), this.y, 20, 10);
            } else if (this.attackType === 'low') {
                ctx.fillRect(this.x + (this.controls.left === 'ArrowLeft' ? -20 : this.width), this.y + this.height - 10, 20, 10);
            }
            this.attackTimer--;
        }
    }

    move() {
        if (keys[this.controls.left]) {
            this.x -= 5;
        }
        if (keys[this.controls.right]) {
            this.x += 5;
        }
        if (keys[this.controls.up]) {
            this.jump();
        } else {
            this.jumpingKeyPressed = false; // Reset the jump key state when the key is released
        }
        if (keys[this.controls.down]) {
            this.crouch();
        } else {
            this.stand();
        }
    }

    crouch() {
        if (!this.isCrouching && this.y === this.groundY) {
            this.y = this.y + this.height / 2;
            this.isCrouching = true;
        }
    }

    stand() {
        if (this.isCrouching) {
            this.y = this.y - this.height / 2;
        }
        this.isCrouching = false;
    }

    attack(type) {
        if (type === 'high' && !this.highAttackKeyPressed) {
            this.attackType = type;
            this.attackTimer = 2; // Adjust the attack duration as needed
            this.highAttackKeyPressed = true;
        }
        if (type === 'low' && !this.lowAttackKeyPressed) {
            this.attackType = type;
            this.attackTimer = 2; // Adjust the attack duration as needed
            this.lowAttackKeyPressed = true;
        }
    }

    getDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            endGame();
        }
    }
}

const player1 = new Player(140, 300, 'red', { left: 'q', right: 'd', up: 'z', down: 's', highAttack: 'a', lowAttack: 'w' });
const player2 = new Player(200, 300, 'blue', { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown', highAttack: 'p', lowAttack: 'm' });

document.addEventListener('keydown', (event) => {
    keys[event.key] = true;

    if (event.key === player1.controls.highAttack && !player1.highAttackKeyPressed) {
        player1.attack('high');
    }
    if (event.key === player1.controls.lowAttack && !player1.lowAttackKeyPressed) {
        player1.attack('low');
    }
    if (event.key === player2.controls.highAttack && !player2.highAttackKeyPressed) {
        player2.attack('high');
    }
    if (event.key === player2.controls.lowAttack && !player2.lowAttackKeyPressed) {
        player2.attack('low');
    }
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;

    if (event.key === player1.controls.highAttack) {
        player1.highAttackKeyPressed = false;
    }
    if (event.key === player1.controls.lowAttack) {
        player1.lowAttackKeyPressed = false;
    }
    if (event.key === player2.controls.highAttack) {
        player2.highAttackKeyPressed = false;
    }
    if (event.key === player2.controls.lowAttack) {
        player2.lowAttackKeyPressed = false;
    }
});

function detectCollision() {
    if (player1.attackTimer > 0 && player1.attackType === 'high' &&
        player1.x + player1.width + player1.highReach >= player2.x &&
        player1.x - player1.highReach <= player2.x + player2.width &&
        player1.y === player2.y) {
        console.log('high');
        player2.getDamage(1);
    }
    if (player1.attackTimer > 0 && player1.attackType === 'low' &&
        player1.x + player1.width >= player2.x &&
        player1.x <= player2.x + player2.width &&
        player1.y + player1.height - 10 === player2.y + player2.height - 10) {
        console.log('low');
        player2.getDamage(2);
    }

    if (player2.attackTimer > 0 && player2.attackType === 'high' &&
        player2.x <= player1.x + player1.width &&
        player2.x + player2.width >= player1.x &&
        player2.y === player1.y) {
        player1.getDamage(1);
    }

    if (player2.attackTimer > 0 && player2.attackType === 'low' &&
        player2.x <= player1.x + player1.width &&
        player2.x + player2.width >= player1.x &&
        player2.y + player2.height - 10 === player1.y + player1.height - 10) {
        player1.getDamage(2);
    }
}

function drawHealthBar() {
    ctx.fillStyle = 'red';
    ctx.fillRect(50, 50, player1.health * 20, 20);
    ctx.fillStyle = 'blue';
    ctx.fillRect(550, 50, player2.health * 20, 20);
}

function endGame(){
    const message = player1.health > player2.health ? "Winner : Player 1 !" : "Winner 2 : Player 2 !";
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    player1.move();
    player2.move();

    player1.update();
    player2.update();

    player1.draw();
    player2.draw();
    detectCollision();
    drawHealthBar();

    requestAnimationFrame(gameLoop);
}

gameLoop();