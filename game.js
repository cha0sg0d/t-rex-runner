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
        this.chunkWidth = Math.floor(canvas.width * 3/4);
        console.log(`Chunk width: ${this.chunkWidth} ${canvas.width}`);
        this.currentChunk = 0;

        // Ground properties
        this.groundSourceWidth = 600;     // Width of one ground segment in sprite
        this.groundSourceHeight = 12;
        this.groundY = canvas.height - 24;
        
        // Define the two possible ground types
        this.groundTypes = {
            FLAT: spriteDefinition.HORIZON.x,
            BUMPY: spriteDefinition.HORIZON.x + this.groundSourceWidth
        };
        
        this.bumpThreshold = 0.5; // 50% chance of bumpy ground
        
        // Add seed for random generation
        this.seed = 12345; // You can set this to any number
        
        // Initialize chunks map instead of array
        this.chunks = new Map();
        
        // Generate initial chunks
        this.generateInitialChunks();
    }

    // Add seeded random function
    seededRandom(chunkIndex) {
        // Simple seeded random function
        const x = Math.sin(this.seed + chunkIndex) * 10000;
        return x - Math.floor(x);
    }

    getRandomGroundType(chunkIndex) {
        // Use seeded random instead of Math.random
        return this.seededRandom(chunkIndex) > this.bumpThreshold ? 
            this.groundTypes.BUMPY : 
            this.groundTypes.FLAT;
    }

    generateChunk(chunkIndex) {
        console.log(`Generating chunk ${chunkIndex}`);
        const chunk = {
            startX: chunkIndex * this.chunkWidth,
            clouds: [],
            groundSourceX: this.getRandomGroundType(chunkIndex)
        };

        // Add clouds using seeded random
        const numClouds = 1 + Math.floor(this.seededRandom(chunkIndex * 2) * 2);
        for (let i = 0; i < numClouds; i++) {
            chunk.clouds.push({
                x: chunk.startX + this.seededRandom(chunkIndex * 3 + i) * this.chunkWidth,
                y: 20 + this.seededRandom(chunkIndex * 4 + i) * 60,
                sourceX: spriteDefinition.CLOUD.x,
                sourceY: spriteDefinition.CLOUD.y
            });
        }

        return chunk;
    }

    generateInitialChunks() {
        // Generate chunks around starting position
        for (let i = -1; i <= 1; i++) {
            this.chunks.set(i, this.generateChunk(i));
        }
    }

    updateChunks(dinoX) {
        // Calculate which chunk the dino is in
        const currentChunkIndex = Math.floor(dinoX / this.chunkWidth);
        
        // If we've moved to a new chunk
        if (currentChunkIndex !== this.currentChunk) {
            this.currentChunk = currentChunkIndex;
            
            // Generate chunks in both directions
            for (let i = currentChunkIndex - 1; i <= currentChunkIndex + 1; i++) {
                if (!this.chunks.has(i)) {
                    this.chunks.set(i, this.generateChunk(i));
                }
            }
            
            // Remove chunks that are too far away
            for (const [index, chunk] of this.chunks) {
                if (Math.abs(index - currentChunkIndex) > 1) {
                    console.log(`Removing chunk ${index}`);
                    this.chunks.delete(index);
                }
            }
        }
    }

    draw(ctx, spriteSheet, dinoX, dinoY) {
        // Draw all chunks in the map
        for (const chunk of this.chunks.values()) {
            // Draw ground segment for this chunk
            ctx.drawImage(
                spriteSheet,
                chunk.groundSourceX,           // Source X (flat or bumpy)
                spriteDefinition.HORIZON.y,    // Source y
                this.groundSourceWidth,        // Source width
                this.groundSourceHeight,       // Source height
                chunk.startX,                  // Destination x
                this.groundY,                  // Destination y
                this.chunkWidth,              // Scale to chunk width
                this.groundSourceHeight        // Destination height
            );

            // Debug visualization
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 1;
            ctx.strokeRect(
                chunk.startX,
                0,
                this.chunkWidth,
                this.canvas.height
            );
            
            ctx.fillStyle = 'red';
            ctx.font = '20px Arial';
            ctx.fillText(
                `Chunk ${Math.floor(chunk.startX / this.chunkWidth)}`,
                chunk.startX + 10,
                30
            );

            // Draw clouds
            chunk.clouds.forEach(cloud => {
                ctx.drawImage(
                    spriteSheet,
                    cloud.sourceX,
                    cloud.sourceY,
                    46,
                    14,
                    cloud.x,
                    cloud.y,
                    46,
                    14
                );
            });
        }

        // Debug info
        ctx.fillStyle = 'black';
        ctx.fillText(`Chunk: ${this.currentChunk}`, dinoX, dinoY - 20);
        ctx.fillText(`Dino X: ${dinoX}`, dinoX, dinoY - 40);
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
                    this.logDebugInfo();
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
        
        // Add camera properties
        this.cameraOffset = 0;
        this.CAMERA_FOLLOW_SPEED = 0.1; // Adjust for smoother/faster camera
        
        // Start the game loop
        this.gameLoop();
    }

    logDebugInfo() {
        console.log(`Dino position - X: ${this.dino.x}, Y: ${this.dino.y}`);
        // Active Chunk
        console.log(`Active Chunk: ${this.horizon.currentChunk}`, this.horizon.chunks.find(chunk => chunk.startX === this.horizon.currentChunk * this.horizon.chunkWidth));
    }

    updateCamera() {
        // Calculate desired camera position (center dino)
        const desiredCameraX = this.dino.x - (this.canvas.width / 2);
        
        // Smooth camera movement
        this.cameraOffset += (desiredCameraX - this.cameraOffset);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save the canvas state
        this.ctx.save();
        
        // Apply camera transform to everything
        this.ctx.translate(-this.cameraOffset, 0);
        
        // Draw everything in world space
        this.horizon.draw(this.ctx, this.spriteSheet, this.dino.x, this.dino.y);
        this.dino.draw(this.ctx, this.spriteSheet);
        
        // Restore canvas state
        this.ctx.restore();
    }
    
    gameLoop() {
        this.dino.update(this.canvas);
        this.horizon.updateChunks(this.dino.x); // Still uses absolute position
        this.updateCamera();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.onload = () => {
    new Game();
}; 