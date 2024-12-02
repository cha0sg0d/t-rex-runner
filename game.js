// Utilities
function getRandomNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Runner {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.spriteSheet = new Image();
    this.spriteSheet.src = "assets/default_100_percent/100-offline-sprite.png";
    
    // Set canvas dimensions
    this.canvas.width = 600;
    this.canvas.height = 150;
    
    // Add white outline to canvas
    this.canvas.style.border = '2px solid black';

    this.horizon = new Horizon(this.canvas, this.ctx, this.spriteSheet);
    this.horizon.addCloud();

    this.dino = new Dino(this.canvas, this.ctx, this.spriteSheet);

    this.gameLoop();
  }

  update() {
    this.horizon.update();
    this.dino.update();
  }

  gameLoop() {
    this.update();
    requestAnimationFrame(() => this.gameLoop());
  }
}

class Dino {
    static config = {
      WIDTH: 44,
      HEIGHT: 47,
      SPRITE_POSITIONS: {
        STANDING: { x: 848, y: 2 },
        RUNNING_1: { x: 936, y: 2 },
        RUNNING_2: { x: 980, y: 2 }
      },
      GROUND_OFFSET: 12,
      RUN_ANIMATION_RATE: 6,
      JUMP_SPEED: -10,
      GRAVITY: 0.6
    };
  
    constructor(canvas, ctx, spriteSheet) {
      this.canvas = canvas;
      this.ctx = ctx;
      this.spriteSheet = spriteSheet;
      this.xPos = 0;
      this.yPos = canvas.height - Dino.config.HEIGHT - Dino.config.GROUND_OFFSET;
      this.frameCount = 0;
      this.currentSprite = 'STANDING';
      this.velocityY = 0;
      this.isJumping = false;
      
      document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !this.isJumping) {
          this.jump();
        }
      });
    }
  
    draw() {
      const sprite = Dino.config.SPRITE_POSITIONS[this.currentSprite];
      this.ctx.save();
      this.ctx.drawImage(
        this.spriteSheet,
        sprite.x,
        sprite.y,
        Dino.config.WIDTH,
        Dino.config.HEIGHT,
        this.xPos,
        this.yPos,
        Dino.config.WIDTH,
        Dino.config.HEIGHT
      );
      this.ctx.restore();
    }
  
    update() {
      if (this.isJumping) {
        this.yPos += this.velocityY;
        this.velocityY += Dino.config.GRAVITY;

        const groundY = this.canvas.height - Dino.config.HEIGHT - Dino.config.GROUND_OFFSET;
        if (this.yPos >= groundY) {
          this.yPos = groundY;
          this.velocityY = 0;
          this.isJumping = false;
        }
      }

      if (!this.isJumping) {
        this.frameCount++;
        if (this.frameCount >= Dino.config.RUN_ANIMATION_RATE) {
          this.frameCount = 0;
          if (this.currentSprite === 'RUNNING_1') {
            this.currentSprite = 'RUNNING_2';
          } else {
            this.currentSprite = 'RUNNING_1';
          }
        }
      }

      this.draw();
    }

    jump() {
      this.isJumping = true;
      this.velocityY = Dino.config.JUMP_SPEED;
    }
  }

class Cloud {
  static config = {
    HEIGHT: 14,
    WIDTH: 46,
    SPRITE_X: 86,
    SPRITE_Y: 2,
    MIN_SPEED: 1,
    MAX_SPEED: 3,
    MIN_Y: 10,
    MAX_Y: 80
  };

  constructor(canvas, ctx, spriteSheet) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.spriteSheet = spriteSheet;
    this.xPos = this.canvas.width;
    this.yPos = getRandomNum(Cloud.config.MIN_Y, Cloud.config.MAX_Y);
    this.remove = false;
    this.speed = getRandomNum(Cloud.config.MIN_SPEED, Cloud.config.MAX_SPEED) / 2;
  }

  draw() {
    this.ctx.save();
    this.ctx.drawImage(
        this.spriteSheet,
        Cloud.config.SPRITE_X,
        Cloud.config.SPRITE_Y,
        Cloud.config.WIDTH,
        Cloud.config.HEIGHT,
        this.xPos,
        this.yPos,
        Cloud.config.WIDTH,
        Cloud.config.HEIGHT
      );    
    this.ctx.restore();
  }

  update() {
    if (!this.remove) {
      this.xPos -= this.speed;
      this.draw();

      if (!this.isVisible()) {
        this.remove = true;
      }
    }
  }

  isVisible() {
    return this.xPos + Cloud.config.WIDTH > 0;
  }
}

class HorizonLine {
    static config = {
        SPRITE_X: 2,
        SPRITE_Y: 54,
        WIDTH: 600,
        HEIGHT: 12
    }
    constructor(canvas, ctx, spriteSheet) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.spriteSheet = spriteSheet;
        this.yPos = canvas.height - 24;
        this.bumpyGround = true
        this.xPos = 0;
    }

    draw() {
        this.ctx.save();
        this.ctx.drawImage(
            this.spriteSheet,
            HorizonLine.config.SPRITE_X,
            HorizonLine.config.SPRITE_Y,
            HorizonLine.config.WIDTH + (this.bumpyGround ? HorizonLine.config.WIDTH : 0),
            HorizonLine.config.HEIGHT,
            this.xPos,
            this.yPos,
            HorizonLine.config.WIDTH,
            HorizonLine.config.HEIGHT
        );
        this.ctx.drawImage(
            this.spriteSheet,
            HorizonLine.config.SPRITE_X,
            HorizonLine.config.SPRITE_Y,
            HorizonLine.config.WIDTH + (this.bumpyGround ? HorizonLine.config.WIDTH : 0),
            HorizonLine.config.HEIGHT,
            this.xPos + HorizonLine.config.WIDTH,
            this.yPos,
            HorizonLine.config.WIDTH,
            HorizonLine.config.HEIGHT
        );
        this.ctx.restore();
    }

    update(speed) {
        this.xPos -= speed;
        if (this.xPos <= -HorizonLine.config.WIDTH) {
            this.xPos = 0;
        }
    }

}

class Obstacle {
    static config = {
      CACTUS_SMALL: {
        WIDTH: 17,
        HEIGHT: 35,
        SPRITE_X: 228,
        SPRITE_Y: 2,
        Y_POS: 105
      },
      CACTUS_LARGE: {
        WIDTH: 25,
        HEIGHT: 50,
        SPRITE_X: 332,
        SPRITE_Y: 2,
        Y_POS: 90
      },
      MAX_OBSTACLE_LENGTH: 3,
      MIN_SPEED: 2,
      SPEED_OFFSET: 0.8
    };
  
    constructor(canvas, ctx, spriteSheet) {
      this.canvas = canvas;
      this.ctx = ctx;
      this.spriteSheet = spriteSheet;
      this.size = Math.floor(Math.random() * Obstacle.config.MAX_OBSTACLE_LENGTH) + 1;
      
      // Randomly choose between small and large cactus
      this.type = Math.random() > 0.5 ? Obstacle.config.CACTUS_SMALL : Obstacle.config.CACTUS_LARGE;
      
      this.width = this.type.WIDTH * this.size;
      this.height = this.type.HEIGHT;
      this.xPos = this.canvas.width;
      this.yPos = this.canvas.height - this.height - 12; // 12 is ground height
      this.remove = false;
      this.speed = Obstacle.config.MIN_SPEED;
    }
  
    draw() {
      this.ctx.save();
      
      // Draw each cactus in the group
      for (let i = 0; i < this.size; i++) {
        this.ctx.drawImage(
          this.spriteSheet,
          this.type.SPRITE_X,
          this.type.SPRITE_Y,
          this.type.WIDTH,
          this.type.HEIGHT,
          this.xPos + (i * this.type.WIDTH),
          this.yPos,
          this.type.WIDTH,
          this.type.HEIGHT
        );
      }
      
      this.ctx.restore();
    }
  
    update() {
      if (!this.remove) {
        this.xPos -= this.speed;
        this.draw();
  
        if (!this.isVisible()) {
          this.remove = true;
        }
      }
    }
  
    isVisible() {
      return this.xPos + this.width > 0;
    }
  }

class Horizon {
  constructor(canvas, ctx, spriteSheet) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.spriteSheet = spriteSheet;
    this.clouds = [];
    this.horizonLine = new HorizonLine(this.canvas, this.ctx, this.spriteSheet);
    this.cloudSpawnTimer = 0;
    this.obstacles = [];
    this.obstacleSpawnTimer = 0;
  }

  addCloud() {
    this.clouds.push(new Cloud(this.canvas, this.ctx, this.spriteSheet));
  }

  addObstacle() {
    this.obstacles.push(new Obstacle(this.canvas, this.ctx, this.spriteSheet));
  }

  update() {
    const speed = 2;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.horizonLine.update(speed);
    
    // Remove clouds and obstacles that are marked for removal
    this.clouds = this.clouds.filter(cloud => !cloud.remove);
    this.obstacles = this.obstacles.filter(obstacle => !obstacle.remove);
    
    // Randomly spawn new clouds
    this.cloudSpawnTimer++;
    if (this.cloudSpawnTimer > getRandomNum(150, 300)) {
      this.addCloud();
      this.cloudSpawnTimer = 0;
    }

    // Randomly spawn new obstacles
    this.obstacleSpawnTimer++;
    if (this.obstacleSpawnTimer > getRandomNum(150, 300)) {
      this.addObstacle();
      this.obstacleSpawnTimer = 0;
    }
    
    this.clouds.forEach(cloud => cloud.update());
    this.obstacles.forEach(obstacle => obstacle.update());
    
    this.draw();
  }

  draw() {
    this.clouds.forEach(cloud => cloud.draw());
    this.obstacles.forEach(obstacle => obstacle.draw());
    this.horizonLine.draw();
  }
}



// Initialize game
window.onload = () => {
  const game = new Runner();
};
