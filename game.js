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
        
        // Add dance animation properties
        this.danceFrames = [
            { x: spriteDefinition.TREX.x + 88, y: spriteDefinition.TREX.y },  // Right leg up
            { x: spriteDefinition.TREX.x + 132, y: spriteDefinition.TREX.y }, // Left leg up
        ];
        this.isDancing = false;
        this.danceFrameCount = 0;
        this.DANCE_FRAME_SPEED = 3; // Faster than running animation
        this.danceTimer = 0;
        this.DANCE_DURATION = 60; // Dance for 60 frames (about 1 second)
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

    startDancing() {
        this.isDancing = true;
        this.danceTimer = 0;
        this.currentFrame = 0;
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
        } else if (this.isDancing) {
            this.danceFrameCount++;
            if (this.danceFrameCount >= this.DANCE_FRAME_SPEED) {
                this.currentFrame = (this.currentFrame + 1) % this.danceFrames.length;
                this.sourceX = this.danceFrames[this.currentFrame].x;
                this.sourceY = this.danceFrames[this.currentFrame].y;
                this.danceFrameCount = 0;
            }

            this.danceTimer++;
            if (this.danceTimer >= this.DANCE_DURATION) {
                this.isDancing = false;
            }
        } else if (!this.isJumping) {
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

class NPC {
    constructor(canvas, width, height) {
        this.width = width;
        this.height = height;
        this.x = canvas.width;  // Start from right side
        this.y = 0;  // Will be set by child classes
        this.active = true;  // For collision detection
    }

    checkCollision(dino) {
        if (!this.active) return false;
        
        return (
            this.x < dino.x + dino.width &&
            this.x + this.width > dino.x &&
            this.y < dino.y + dino.height &&
            this.y + this.height > dino.y
        );
    }

    update() {
        // Base update method to be overridden
    }

    draw(ctx, spriteSheet) {
        // Base draw method to be overridden
    }
}

class Bird extends NPC {
    constructor(canvas) {
        super(canvas, 46, 40);
        this.y = canvas.height - this.height - 100;
        this.sourceX = spriteDefinition.PTERODACTYL.x;
        this.sourceY = spriteDefinition.PTERODACTYL.y;
        this.speed = 3;
        
        // Add patrol area properties
        this.patrolStartX = this.x;  // Starting point
        this.patrolWidth = 200;      // Width of patrol area
        this.movingLeft = true;      // Direction flag
        
        // Animation properties
        this.frames = [
            { x: spriteDefinition.PTERODACTYL.x, y: spriteDefinition.PTERODACTYL.y },
            { x: spriteDefinition.PTERODACTYL.x + 46, y: spriteDefinition.PTERODACTYL.y }
        ];
        this.currentFrame = 0;
        this.frameCount = 0;
        this.FRAME_CHANGE_SPEED = 15;
    }

    update() {
        if (!this.active) return;
        
        // Update position based on direction
        if (this.movingLeft) {
            this.x -= this.speed;
            // Check if reached left boundary
            if (this.x <= this.patrolStartX - this.patrolWidth) {
                this.movingLeft = false;
            }
        } else {
            this.x += this.speed;
            // Check if reached right boundary
            if (this.x >= this.patrolStartX) {
                this.movingLeft = true;
            }
        }
        
        // Animation
        this.frameCount++;
        if (this.frameCount >= this.FRAME_CHANGE_SPEED) {
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
            this.sourceX = this.frames[this.currentFrame].x;
            this.sourceY = this.frames[this.currentFrame].y;
            this.frameCount = 0;
        }
    }

    draw(ctx, spriteSheet) {
        if (!this.active) return;
        
        ctx.save();
        
        // Flip the bird sprite based on direction
        if (!this.movingLeft) {
            ctx.scale(-1, 1);
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
        
        // Update event listeners
        document.addEventListener('keydown', (event) => {
            switch(event.code) {
                case 'ArrowUp':
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
        
        // Add birds array
        this.birds = [new Bird(this.canvas)];
        
        // Add new properties at the start of constructor
        this.isInCombat = false;
        this.currentBird = null;
        
        // Add combat view event listener
        document.addEventListener('keydown', (event) => {
            if (this.isInCombat && event.code === 'KeyW') {
                alert('You waved!');
                // this.exitCombat();
            }
        });
        
        // Add combat menu properties
        this.combatOptions = ['FIGHT', 'WAVE', 'DANCE', 'RUN'];
        this.selectedOption = 0;  // Currently selected menu item
        
        // Update combat key listeners
        document.addEventListener('keydown', (event) => {
            if (this.isInCombat) {
                switch(event.code) {
                    case 'ArrowLeft':
                        this.selectedOption = Math.max(0, this.selectedOption - 1);
                        break;
                    case 'ArrowRight':
                        this.selectedOption = Math.min(this.combatOptions.length - 1, this.selectedOption + 1);
                        break;
                    case 'Enter':
                    case 'Space':
                        this.handleCombatOption(this.combatOptions[this.selectedOption]);
                        break;
                }
            }
        });
        
        // Start the game loop
        this.gameLoop();

        this.combatMenu = document.getElementById('combatMenu');
        this.setupCombatListeners();

        // Add click handlers for combat options
        document.querySelectorAll('.combat-option').forEach((button, index) => {
            button.addEventListener('click', (e) => {
                const action = e.target.textContent;
                if (action === 'RUN') {
                    this.exitCombat();
                } else {
                    console.log(`Clicked ${action} option`);
                }
            });
        });

        // Add debug button for combat view
        this.createDebugButton();

        // Add fade transition properties
        this.fadeAlpha = 0;
        this.isFading = false;
        this.FADE_SPEED = 0.05;
        this.fadeCallback = null;
    }

    createDebugButton() {
        const debugButton = document.createElement('button');
        debugButton.textContent = 'Debug Combat';
        debugButton.style.position = 'fixed';
        debugButton.style.top = '10px';
        debugButton.style.right = '10px';
        debugButton.style.zIndex = '1000';
        debugButton.addEventListener('click', () => {
            if (!this.isInCombat) {
                // Create a temporary bird for combat testing
                const testBird = new Bird(this.canvas);
                this.enterCombat(testBird);
            } else {
                this.exitCombat();
            }
        });
        document.body.appendChild(debugButton);
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

    enterCombat(bird) {
        // Start fade in transition
        this.isFading = true;
        this.fadeAlpha = 0;
        this.fadeCallback = () => {
            this.isInCombat = true;
            this.currentBird = bird;
            // Start fade out
            this.isFading = true;
            this.fadeAlpha = 1;
            this.fadeCallback = null;
        };
    }

    exitCombat() {
        // Start fade in transition
        this.isFading = true;
        this.fadeAlpha = 0;
        this.fadeCallback = () => {
            this.isInCombat = false;
            this.currentBird = null;
            document.getElementById('combatMenu').classList.add('hidden');
            this.selectedOption = 0;
            // Start fade out
            this.isFading = true;
            this.fadeAlpha = 1;
            this.fadeCallback = null;
        };
    }

    checkCollisions() {
        for (const bird of this.birds) {
            if (bird.checkCollision(this.dino) && !this.isInCombat) {
                this.enterCombat(bird);
                return; // Stop checking other collisions
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.isInCombat) {
            this.drawCombatView();
        } else {
            // Normal game view drawing
            this.ctx.save();
            this.ctx.translate(-this.cameraOffset, 0);
            this.horizon.draw(this.ctx, this.spriteSheet, this.dino.x, this.dino.y);
            this.dino.draw(this.ctx, this.spriteSheet);
            for (const bird of this.birds) {
                bird.draw(this.ctx, this.spriteSheet);
            }
            this.ctx.restore();
        }

        // Draw fade overlay
        if (this.isFading) {
            this.ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeAlpha})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Update fade
            if (this.fadeCallback) {
                this.fadeAlpha += this.FADE_SPEED;
                if (this.fadeAlpha >= 1) {
                    this.fadeCallback();
                }
            } else {
                this.fadeAlpha -= this.FADE_SPEED;
                if (this.fadeAlpha <= 0) {
                    this.isFading = false;
                }
            }
        }
    }

    drawCombatView() {
        // Draw a lighter background
        this.ctx.fillStyle = '#f7f7f7';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Fixed positions for combat sprites
        const dinoScale = 2;
        const birdScale = 2;
        const dinoCombatX = 50;
        const birdCombatX = this.canvas.width - 150;
        const combatY = this.canvas.height / 2;
        
        // Draw larger dino in bottom left
        this.ctx.save();
        this.ctx.scale(dinoScale, dinoScale);
        this.ctx.drawImage(
            this.spriteSheet,
            this.dino.sourceX,
            this.dino.sourceY,
            this.dino.width,
            this.dino.height,
            dinoCombatX / dinoScale,
            (this.canvas.height - 100) / dinoScale, // Position near bottom
            this.dino.width,
            this.dino.height
        );
        this.ctx.restore();
        
        // Draw larger bird in top right
        if (this.currentBird) {
            this.ctx.save();
            this.ctx.scale(birdScale, birdScale);
            this.ctx.drawImage(
                this.spriteSheet,
                this.currentBird.sourceX,
                this.currentBird.sourceY,
                this.currentBird.width,
                this.currentBird.height,
                birdCombatX / birdScale,
                50 / birdScale, // Position near top
                this.currentBird.width,
                this.currentBird.height
            );
            this.ctx.restore();
        }
        
        // Draw debug info above dino
        this.ctx.fillStyle = 'red';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`Dino Debug:`, dinoCombatX, combatY - 60);
        this.ctx.fillText(`Game pos: (${Math.round(this.dino.x)}, ${Math.round(this.dino.y)})`, dinoCombatX, combatY - 40);
        this.ctx.fillText(`Combat pos: (${dinoCombatX}, ${combatY})`, dinoCombatX, combatY - 20);
        this.ctx.fillText(`Source: (${this.dino.sourceX}, ${this.dino.sourceY})`, dinoCombatX, combatY);

        // Draw debug info above bird
        if (this.currentBird) {
            this.ctx.fillText(`Bird Debug:`, birdCombatX - 100, combatY - 60);
            this.ctx.fillText(`Game pos: (${Math.round(this.currentBird.x)}, ${Math.round(this.currentBird.y)})`, birdCombatX - 100, combatY - 40);
            this.ctx.fillText(`Combat pos: (${birdCombatX}, ${combatY})`, birdCombatX - 100, combatY - 20);
            this.ctx.fillText(`Source: (${this.currentBird.sourceX}, ${this.currentBird.sourceY})`, birdCombatX - 100, combatY);
        }
        
        // Show and position the combat menu
        const combatMenu = document.getElementById('combatMenu');
        const canvas = document.getElementById('gameCanvas');
        const canvasRect = canvas.getBoundingClientRect();
        
        // Position the menu in the bottom center-right of the canvas
        combatMenu.style.position = 'absolute';
        combatMenu.style.bottom = '20px';  // Distance from bottom of canvas
        combatMenu.style.left = `${canvasRect.left + (canvas.width * 0.5)}px`;  // Changed from 0.6 to 0.5 for more centered position
        combatMenu.style.transform = 'translateX(-50%)';  // Center the menu
        // Draw outline around combat menu
        // combatMenu.style.border = '4px solid #FFFFFF';
        // combatMenu.style.borderRadius = '8px';
        // combatMenu.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
        
        combatMenu.classList.remove('hidden');
    }

    handleCombatOption(action) {
        const option = action.toUpperCase().trim();
        const combatMenu = document.getElementById('combatMenu');
        const originalContent = combatMenu.innerHTML;
        

        let updateCombatMenu = true;
        console.log(`Handling ${option} option`);
        // Handle specific actions
        switch(option) {
            case 'WAVE':
                console.log('WAVE');
                break;
            case 'DANCE':
                this.dino.startDancing();
                break;
            case 'FIGHT':
                console.log('FIGHT');
                break;
            case 'RUN':
                updateCombatMenu = false;
                this.exitCombat();
                break;
        }

        if (updateCombatMenu) {
            combatMenu.innerHTML = `
            <div class="col-span-2 flex items-center justify-center h-full">
                <span class="text-2xl font-bold">${option}!</span>
                </div>
            `;
        }
        
        // Return to original menu after delay
        setTimeout(() => {
            combatMenu.innerHTML = originalContent;
            this.setupCombatListeners();
        }, 1000);
    }
    
    gameLoop() {
        this.dino.update(this.canvas);
        this.horizon.updateChunks(this.dino.x); // Still uses absolute position
        
        // Update and check birds
        for (const bird of this.birds) {
            bird.update();
        }
        this.checkCollisions();
        
        this.updateCamera();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    setupCombatListeners() {
        const combatOptions = document.querySelectorAll('.combat-option');
        combatOptions.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleCombatOption(e.target.textContent.toLowerCase());
            });
        });
    }
}

// Start the game when the page loads
window.onload = () => {
    new Game();
}; 