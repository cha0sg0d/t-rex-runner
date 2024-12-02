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
    SPRITE_Y: 2
  };

  constructor(canvas, ctx, spriteSheet) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.spriteSheet = spriteSheet;
    this.xPos = this.canvas.width;
    this.yPos = 0;
    this.remove = false;
    
  }

  getRandomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

  update(speed) {
    if (!this.remove) {
      this.xPos -= Math.ceil(speed);
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

class Horizon {
  constructor(canvas, ctx, spriteSheet) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.spriteSheet = spriteSheet;
    this.clouds = [];
    
  }

  addCloud() {
    this.clouds.push(new Cloud(this.canvas, this.ctx, this.spriteSheet));
  }

  update() {
    this.draw()
  }

  draw() {
    this.clouds.forEach(cloud => {
      cloud.draw();
    });
  }
}


// Initialize game
window.onload = () => {
  const game = new Runner();
};
