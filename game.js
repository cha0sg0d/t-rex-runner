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

    this.gameLoop();
  }

  update() {
    this.horizon.update();
  }

  gameLoop() {
    this.update();
    requestAnimationFrame(() => this.gameLoop());
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
    MAX_Y: 50
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
        this.xPos - 100,
        this.yPos + 50,
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

class Horizon {
  constructor(canvas, ctx, spriteSheet) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.spriteSheet = spriteSheet;
    this.clouds = [];
    this.horizonLine = new HorizonLine(this.canvas, this.ctx, this.spriteSheet);
    this.cloudSpawnTimer = 0;
  }

  addCloud() {
    this.clouds.push(new Cloud(this.canvas, this.ctx, this.spriteSheet));
  }

  update() {
    const speed = 2;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.horizonLine.update(speed);
    
    // Remove clouds that are marked for removal
    this.clouds = this.clouds.filter(cloud => !cloud.remove);
    
    // Randomly spawn new clouds
    this.cloudSpawnTimer++;
    if (this.cloudSpawnTimer > getRandomNum(150, 300)) {
      this.addCloud();
      this.cloudSpawnTimer = 0;
    }
    
    this.clouds.forEach(cloud => {
      cloud.update();
    });
    this.draw();
  }

  draw() {
    this.clouds.forEach(cloud => {
      cloud.draw();
    });
    this.horizonLine.draw();
  }
}


// Initialize game
window.onload = () => {
  const game = new Runner();
};
