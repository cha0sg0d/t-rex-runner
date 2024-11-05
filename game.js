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
        
        // Add movement properties
        this.velocityX = 0;
        this.speed = 5;        // Horizontal movement speed
        this.isMoving = false; // Track if dino is moving
    }

    setDirection(newDirection) {
        if (this.direction !== newDirection) {
            this.direction = newDirection;
            this.facingLeft = (newDirection === 'left');
        }
        
        // Set horizontal velocity based on direction
        if (newDirection === 'left') {
            this.velocityX = -this.speed;
            this.isMoving = true;
        } else if (newDirection === 'right') {
            this.velocityX = this.speed;
            this.isMoving = true;
        }
    }

    stopMoving() {
        this.velocityX = 0;
        this.isMoving = false;
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
        // Add horizontal movement
        this.x += this.velocityX;
        
        // Keep dino within canvas bounds
        if (this.x < 0) this.x = 0;
        if (this.x > canvas.width - this.width) this.x = canvas.width - this.width;

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
            // Only animate if moving horizontally
            if (this.isMoving) {
                this.frameCount++;
                if (this.frameCount >= this.FRAME_CHANGE_SPEED) {
                    this.currentFrame = (this.currentFrame + 1) % this.runningFrames.length;
                    this.sourceX = this.runningFrames[this.currentFrame].x;
                    this.sourceY = this.runningFrames[this.currentFrame].y;
                    this.frameCount = 0;
                }
            } else {
                // Reset to standing frame when not moving
                this.sourceX = this.runningFrames[0].x;
                this.sourceY = this.runningFrames[0].y;
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

class Horizon {
    constructor(canvas) {
        this.canvas = canvas;
        // Cloud properties
        this.clouds = [
            {
                x: 100,
                y: 50,
                sourceX: spriteDefinition.CLOUD.x,
                sourceY: spriteDefinition.CLOUD.y
            },
            {
                x: 400,
                y: 30,
                sourceX: spriteDefinition.CLOUD.x,
                sourceY: spriteDefinition.CLOUD.y
            },
            {
                x: 600,
                y: 70,
                sourceX: spriteDefinition.CLOUD.x,
                sourceY: spriteDefinition.CLOUD.y
            }
        ];
        this.cloudWidth = 46;
        this.cloudHeight = 14;

        // Ground properties
        this.groundY = canvas.height - 24; // Position ground at bottom of canvas
        this.groundSourceWidth = 600;      // Width of ground sprite
        this.groundSourceHeight = 12;      // Height of ground sprite
        this.groundSourceX = spriteDefinition.HORIZON.x;
        this.groundSourceY = spriteDefinition.HORIZON.y;
    }

    draw(ctx, spriteSheet) {
        // Draw the ground
        // We'll repeat the ground sprite to fill the canvas width
        let groundX = 0;
        while (groundX < this.canvas.width) {
            ctx.drawImage(
                spriteSheet,
                this.groundSourceX,
                this.groundSourceY,
                this.groundSourceWidth,
                this.groundSourceHeight,
                groundX,
                this.groundY,
                this.groundSourceWidth,
                this.groundSourceHeight
            );
            groundX += this.groundSourceWidth;
        }

        // Draw all clouds
        this.clouds.forEach(cloud => {
            ctx.drawImage(
                spriteSheet,
                cloud.sourceX,
                cloud.sourceY,
                this.cloudWidth,
                this.cloudHeight,
                cloud.x,
                cloud.y,
                this.cloudWidth,
                this.cloudHeight
            );
        });
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
        
        // Update event listeners
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

        // Add keyup listener to stop movement when keys are released
        document.addEventListener('keyup', (event) => {
            if (event.code === 'ArrowLeft' && this.dino.direction === 'left' ||
                event.code === 'ArrowRight' && this.dino.direction === 'right') {
                this.dino.stopMoving();
            }
        });

        this.horizon = new Horizon(this.canvas);
        
        // Start the game loop
        this.gameLoop();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.horizon.draw(this.ctx, this.spriteSheet);
        this.dino.draw(this.ctx, this.spriteSheet);
    }
    
    gameLoop() {
        this.dino.update(this.canvas);
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.onload = () => {
    new Game();
}; 