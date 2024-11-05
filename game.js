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
        this.chunkWidth = Math.floor(canvas.width * 3/4); // Each chunk is 2/3 of canvas width
        console.log(`Chunk width: ${this.chunkWidth} ${canvas.width}`);
        this.currentChunk = 0; // Track which chunk the dino is in
        
        // Initialize first few chunks
        this.chunks = [
            this.generateChunk(0),
            this.generateChunk(1),
            this.generateChunk(2)
        ];

        // Ground properties remain the same
        this.groundY = canvas.height - 24;
        this.groundSourceWidth = this.chunkWidth;
        this.groundSourceHeight = 12;
        this.groundSourceX = spriteDefinition.HORIZON.x;
        this.groundSourceY = spriteDefinition.HORIZON.y;
    }

    generateChunk(chunkIndex) {
        // Generate a new chunk with random cloud positions
        const chunk = {
            startX: chunkIndex * this.chunkWidth,
            clouds: []
        };

        // Add 1-2 clouds per chunk with random positions
        const numClouds = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < numClouds; i++) {
            chunk.clouds.push({
                x: chunk.startX + Math.random() * this.chunkWidth,
                y: 20 + Math.random() * 60,
                sourceX: spriteDefinition.CLOUD.x,
                sourceY: spriteDefinition.CLOUD.y
            });
        }
        return chunk;
    }

    updateChunks(dinoX) {
        // Determine which chunk the dino is in
        const newChunk = Math.floor(dinoX / this.chunkWidth);
        
        if (newChunk !== this.currentChunk) {
            // Remove chunks that are too far behind
            this.chunks = this.chunks.filter(chunk => 
                chunk.startX >= (newChunk - 1) * this.chunkWidth
            );

            // Generate new chunks ahead
            while (this.chunks.length < 3) {
                const nextChunkIndex = Math.floor(this.chunks[this.chunks.length - 1].startX / this.chunkWidth) + 1;
                this.chunks.push(this.generateChunk(nextChunkIndex));
            }

            this.currentChunk = newChunk;
        }
    }

    draw(ctx, spriteSheet, dinoX, dinoY) {
        // Draw which chunk the dino is in above the dino
        ctx.fillText(`Chunk: ${this.currentChunk}`, dinoX, dinoY - 20);
        ctx.fillText(`Dino X: ${dinoX}`, dinoX, dinoY - 40);

        // Draw the ground (unchanged)
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

        // Draw clouds from active chunks
        this.chunks.forEach(chunk => {
            chunk.clouds.forEach(cloud => {
                ctx.drawImage(
                    spriteSheet,
                    cloud.sourceX,
                    cloud.sourceY,
                    46, // cloudWidth
                    14, // cloudHeight
                    cloud.x,
                    cloud.y,
                    46,
                    14
                );
            });
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
                case 'KeyF':  // Add debug key
                    console.log(`Dino position - X: ${this.dino.x}, Y: ${this.dino.y}`);
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
        this.horizon.draw(this.ctx, this.spriteSheet, this.dino.x, this.dino.y);
        this.dino.draw(this.ctx, this.spriteSheet);
    }
    
    gameLoop() {
        this.dino.update(this.canvas);
        this.horizon.updateChunks(this.dino.x);
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.onload = () => {
    new Game();
}; 