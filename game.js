const spriteDefinition = {
    CACTUS_LARGE: { x: 332, y: 2 },
    CACTUS_SMALL: { x: 228, y: 2 },
    CLOUD: { x: 86, y: 2 },
    HORIZON: { x: 2, y: 54 },
    MOON: { x: 484, y: 2 },
    PTERODACTYL: { x: 134, y: 2 },
    RESTART: { x: 2, y: 2 },
    TEXT_SPRITE: { x: 655, y: 2 },
    TREX: { x: 848, y: 2 },
    STAR: { x: 645, y: 2 }
}

class Dino {
    constructor(canvas) {
        this.width = 44;
        this.height = 47;
        this.x = 50;
        this.y = canvas.height - this.height - 20; // Set initial ground position
        this.sourceX = spriteDefinition.TREX.x;  // From spriteDefinition.TREX.x
        this.sourceY = spriteDefinition.TREX.y;    // From spriteDefinition.TREX.y
        this.velocityY = 0;
        this.isJumping = false;
        this.gravity = 0.6;
        this.jumpForce = -13;
        
        // Add animation properties
        this.runningFrames = [
            { x: spriteDefinition.TREX.x, y: spriteDefinition.TREX.y },      // Standing
            { x: spriteDefinition.TREX.x + 88, y: spriteDefinition.TREX.y }, // Right leg up
            { x: spriteDefinition.TREX.x + 132, y: spriteDefinition.TREX.y } // Left leg up
        ];
        this.currentFrame = 0;
        this.frameCount = 0;
        this.FRAME_CHANGE_SPEED = 5; // Adjust this to change animation speed
        this.facingLeft = false; // Add this property to control direction
        this.direction = 'right'; // Add this to track current direction
    }

    setDirection(newDirection) {
        if (this.direction !== newDirection) {
            this.direction = newDirection;
            this.facingLeft = (newDirection === 'left');
        }
    }

    jump() {
        if (!this.isJumping) {
            this.isJumping = true;
            this.velocityY = this.jumpForce;
            // Reset to standing frame while jumping
            this.sourceX = this.runningFrames[0].x;
            this.sourceY = this.runningFrames[0].y;
        }
    }

    update(canvas) {
        if (this.isJumping) {
            this.velocityY += this.gravity;
            this.y += this.velocityY;
            
            const groundY = canvas.height - this.height - 20;
            if (this.y >= groundY) {
                this.y = groundY;
                this.velocityY = 0;
                this.isJumping = false;
            }
        } else {
            // Animate running
            this.frameCount++;
            if (this.frameCount >= this.FRAME_CHANGE_SPEED) {
                this.currentFrame = (this.currentFrame + 1) % this.runningFrames.length;
                this.sourceX = this.runningFrames[this.currentFrame].x;
                this.sourceY = this.runningFrames[this.currentFrame].y;
                this.frameCount = 0;
            }
        }
    }

    draw(ctx, spriteSheet) {
        // Save the current canvas state
        ctx.save();
        
        if (this.facingLeft) {
            // Flip horizontally by scaling negative on X axis
            ctx.scale(-1, 1);
            // Adjust x position when flipped (mirror position from right side)
            ctx.drawImage(
                spriteSheet,
                this.sourceX,
                this.sourceY,
                this.width,
                this.height,
                -this.x - this.width, // Negative x position when flipped
                this.y,
                this.width,
                this.height
            );
        } else {
            // Normal drawing when facing right
            ctx.drawImage(
                spriteSheet,
                this.sourceX,
                this.sourceY,
                this.width,
                this.height,
                this.x,
                this.y,
                this.width,
                this.height
            );
        }
        
        // Restore the canvas state
        ctx.restore();
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 300;
        
        // Replace dino object with Dino instance
        this.dino = new Dino(this.canvas);
        
        // Load sprite sheet
        this.spriteSheet = new Image();
        this.spriteSheet.src = 'assets/default_100_percent/100-offline-sprite.png';
        
        // Update event listener
        document.addEventListener('keydown', (event) => {
            switch(event.code) {
                case 'Space':
                    this.dino.jump();
                    break;
                case 'ArrowLeft':
                    this.dino.setDirection('left');
                    break;
                case 'ArrowRight':
                    this.dino.setDirection('right');
                    break;
            }
        });
        
        // Start the game loop
        this.gameLoop();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.dino.draw(this.ctx, this.spriteSheet);
    }
    
    gameLoop() {
        // Update dino physics
        this.dino.update(this.canvas);
        // Draw current frame
        this.draw();
        // Recursively call the game loop
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.onload = () => {
    new Game();
}; 