import { ModalManager } from "./modal.js";

// Utilities
function getRandomNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const colors = {
  BLUE: "#3498db",
  GREEN: "#2ecc71",
  RED: "#e74c3c",
  GOLD: "#FFD700",
  ORANGE: "#e67e22",
  PURPLE: "#9b59b6",
};

class Runner {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");

    this.spriteSheet = new Image();
    this.spriteSheet.src = "assets/default_100_percent/100-offline-sprite.png";

    // Set canvas dimensions
    this.canvas.width = 600;
    this.canvas.height = 150;

    // Add white outline to canvas
    this.canvas.style.border = "2px solid black";

    this.floatingTexts = [];
    this.horizon = new Horizon(this.canvas, this.ctx, this.spriteSheet);

    this.speed = 2;
    this.dino = new Dino(this.canvas, this.ctx, this.spriteSheet);
    this.dino.runner = this;
    this.horizon.dino = this.dino;
    this.horizon.runner = this;

    this.gameLoop();
    this.drawInfo();
    this.isPaused = false;

    this.modalManager = new ModalManager();

    // Update pause key listener
    document.addEventListener("keydown", (e) => {
      if (e.code === "KeyP") {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
          this.modalManager.show("pause");
        } else {
          this.modalManager.hide();
        }
      }
    });

    this.distance = 0; // Add distance counter
    this.distanceUnit = "m"; // Add unit for display
  }

  update() {
    if (this.isPaused) return;

    this.floatingTexts = this.floatingTexts.filter((text) => !text.remove);
    this.floatingTexts.forEach((text) => text.update());

    this.horizon.update();
    this.dino.update();
    this.drawInfo();

    this.floatingTexts.forEach((text) => text.draw(this.ctx));

    // Update distance when game is running
    this.distance += this.speed / 10; // Adjust divisor to control distance increment rate
  }

  gameLoop() {
    this.update();
    requestAnimationFrame(() => this.gameLoop());
  }

  drawInfo() {
    const startY = 20;
    const spacing = 120; // Space between each counter
    let currentX = 10; // Start from left side

    this.ctx.save();
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "middle";

    // Water ammo counter
    this.ctx.fillStyle = "#3498db";
    this.ctx.font = '16px "Press Start 2P", monospace';
    this.ctx.fillText("💧", currentX, startY);

    this.ctx.font = '12px "Press Start 2P", monospace';
    this.ctx.fillText(
      `${this.dino.waterAmmoCount} / ${this.dino.maxWaterAmmo}`,
      currentX + 25,
      startY
    );

    // Gas counter
    currentX += spacing;
    this.ctx.fillStyle = colors.RED;
    this.ctx.font = '16px "Press Start 2P", monospace';
    this.ctx.fillText("⛽️", currentX, startY);

    this.ctx.font = '12px "Press Start 2P", monospace';
    this.ctx.fillText(
      `${this.dino.gasCount} / ${this.dino.maxGasCount}`,
      currentX + 25,
      startY
    );

    // Leaf counter
    currentX += spacing;
    this.ctx.fillStyle = "#2ecc71";
    this.ctx.font = '16px "Press Start 2P", monospace';
    this.ctx.fillText("🍃", currentX, startY);

    this.ctx.font = '12px "Press Start 2P", monospace';
    this.ctx.fillText(this.dino.leafCount, currentX + 25, startY);

    // Dollar counter
    currentX += 55;
    this.ctx.fillStyle = colors.GOLD;
    this.ctx.font = '16px "Press Start 2P", monospace';
    this.ctx.fillText("💰", currentX, startY);

    this.ctx.font = '12px "Press Start 2P", monospace';
    this.ctx.fillText(this.dino.dollarCount, currentX + 25, startY);

    // Add distance counter (after other counters)
    currentX += spacing;
    this.ctx.fillStyle = colors.PURPLE;
    this.ctx.font = '12px "Press Start 2P", monospace';
    this.ctx.fillText(
      `${Math.floor(this.distance)}${this.distanceUnit}`,
      currentX + 120,
      startY
    );

    this.ctx.restore();
  }
}

class Dino {
  static config = {
    WIDTH: 44,
    HEIGHT: 47,
    SPRITE_POSITIONS: {
      STANDING: { x: 848, y: 2 },
      RUNNING_1: { x: 936, y: 2 },
      RUNNING_2: { x: 980, y: 2 },
    },
    GROUND_OFFSET: 12,
    RUN_ANIMATION_RATE: 6,
    JUMP_SPEED: -10,
    GRAVITY: 0.6,
    BULLET_SPEED: 7,
    BULLET_WIDTH: 13,
    BULLET_HEIGHT: 7,
    BASE_LEAF_REWARD: 2,
    BASE_$_REWARD: 2,
  };

  constructor(canvas, ctx, spriteSheet) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.spriteSheet = spriteSheet;
    this.xPos = 0;
    this.yPos = canvas.height - Dino.config.HEIGHT - Dino.config.GROUND_OFFSET;
    this.frameCount = 0;
    this.currentSprite = "STANDING";
    this.velocityY = 0;
    this.isJumping = false;
    this.bullets = [];
    this.maxWaterAmmo = 10;
    this.maxGasCount = 10;
    this.waterAmmoCount = this.maxWaterAmmo;
    this.gasCount = this.maxGasCount;
    this.leafCount = 0;
    this.dollarCount = 0;

    document.addEventListener("keydown", (e) => {
      if (e.code === "Space" && !this.isJumping) {
        this.jump();
      }
      if (e.code === "KeyW") {
        this.shoot("water");
      }
      if (e.code === "KeyE") {
        this.shoot("fire");
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

      const groundY =
        this.canvas.height - Dino.config.HEIGHT - Dino.config.GROUND_OFFSET;
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
        if (this.currentSprite === "RUNNING_1") {
          this.currentSprite = "RUNNING_2";
        } else {
          this.currentSprite = "RUNNING_1";
        }
      }
    }

    // Update and draw bullets
    this.bullets.forEach((bullet) => {
      bullet.update(Dino.config.BULLET_SPEED);
      bullet.draw(this.ctx);
    });

    this.draw();
  }

  jump() {
    this.isJumping = true;
    this.velocityY = Dino.config.JUMP_SPEED;
  }

  shoot(type = "water") {
    const bullet = new Bullet(
      this.canvas,
      this.ctx,
      this.xPos + Dino.config.WIDTH,
      this.yPos + Dino.config.HEIGHT / 2,
      Dino.config.BULLET_WIDTH,
      Dino.config.BULLET_HEIGHT,
      type
    );
    if (type === "water" && this.waterAmmoCount > 0) {
      this.bullets.push(bullet);
      this.waterAmmoCount--;
    } else if (type === "fire" && this.gasCount > 0) {
      this.bullets.push(bullet);
      this.gasCount--;
    } else {
      // Show "Out of ammo" floating text
      if (this.runner) {
        const ammoType = type === "water" ? "💧" : "⛽️";
        this.runner.floatingTexts.push(
          new FloatingText(
            this.xPos + Dino.config.WIDTH,
            this.yPos,
            `No ${ammoType}`,
            colors.RED
          )
        );
      }
    }
  }
}

class HorizonLine {
  static config = {
    SPRITE_X: 2,
    SPRITE_Y: 54,
    WIDTH: 600,
    HEIGHT: 12,
  };
  constructor(canvas, ctx, spriteSheet) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.spriteSheet = spriteSheet;
    this.yPos = canvas.height - 24;
    this.bumpyGround = true;
    this.xPos = 0;
  }

  draw() {
    this.ctx.save();
    this.ctx.drawImage(
      this.spriteSheet,
      HorizonLine.config.SPRITE_X,
      HorizonLine.config.SPRITE_Y,
      HorizonLine.config.WIDTH +
        (this.bumpyGround ? HorizonLine.config.WIDTH : 0),
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
      HorizonLine.config.WIDTH +
        (this.bumpyGround ? HorizonLine.config.WIDTH : 0),
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
      Y_POS: 105,
    },
    CACTUS_LARGE: {
      WIDTH: 25,
      HEIGHT: 50,
      SPRITE_X: 332,
      SPRITE_Y: 2,
      Y_POS: 90,
    },
    CLOUD: {
      WIDTH: 46,
      HEIGHT: 14,
      SPRITE_X: 86,
      SPRITE_Y: 2,
      MIN_Y: 30,
      MAX_Y: 100,
    },
    GAS: {
      WIDTH: 47,
      HEIGHT: 23,
      SPRITE_X: 1233,
      SPRITE_Y: 11,
    },
    STORE: {
      WIDTH: 47,
      HEIGHT: 27,
      SPRITE_X: 1233,
      SPRITE_Y: 37,
    },
    MAX_OBSTACLE_LENGTH: 3,
    MIN_SPEED: 2,
    SPEED_OFFSET: 0.8,
  };

  constructor(canvas, ctx, spriteSheet, type) {
    const isCactus = type.includes("CACTUS");
    this.canvas = canvas;
    this.ctx = ctx;
    this.spriteSheet = spriteSheet;
    this.size = isCactus ? this.getCactusSize() : 1;
    this.type = type;
    this.item = isCactus
      ? Obstacle.config[this.getCactusType()]
      : Obstacle.config[type];
    console.log(`SPAWNING ${type}`, this.item);

    this.width = this.item.WIDTH * this.size;
    this.height = this.item.HEIGHT;
    this.xPos = this.canvas.width;
    this.yPos = this.canvas.height - this.height - 12; // 12 is ground height
    this.remove = false;
    this.speed = Obstacle.config.MIN_SPEED;
    this.isHit = false;

    if (type === "CLOUD") {
      this.yPos = getRandomNum(
        Obstacle.config.CLOUD.MIN_Y,
        Obstacle.config.CLOUD.MAX_Y
      );
    }
  }

  getCactusSize() {
    return getRandomNum(1, Obstacle.config.MAX_OBSTACLE_LENGTH);
  }
  getCactusType() {
    return Math.random() > 0.5 ? "CACTUS_SMALL" : "CACTUS_LARGE";
  }

  draw() {
    this.ctx.save();

    if (this.isHit) {
      this.ctx.globalAlpha = 0.3;
    }

    // Draw each cactus in the group
    for (let i = 0; i < this.size; i++) {
      this.ctx.drawImage(
        this.spriteSheet,
        this.item.SPRITE_X,
        this.item.SPRITE_Y,
        this.item.WIDTH,
        this.item.HEIGHT,
        this.xPos + i * this.item.WIDTH,
        this.yPos,
        this.item.WIDTH,
        this.item.HEIGHT
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

class FloatingText {
  constructor(x, y, text, color, speed = 0) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.lifetime = 30;
    this.remove = false;
    this.speed = speed;
  }

  update(speed = 0) {
    this.x -= speed || this.speed;
    this.y -= 1;
    this.lifetime--;
    if (this.lifetime <= 0) {
      this.remove = true;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

class Horizon {
  constructor(canvas, ctx, spriteSheet) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.spriteSheet = spriteSheet;
    this.horizonLine = new HorizonLine(this.canvas, this.ctx, this.spriteSheet);
    this.cloudSpawnTimer = 0;
    this.obstacles = [];
    this.obstacleSpawnTimer = 0;
    this.gasSpawnTimer = 0;
  }

  checkCollisions() {
    this.dino.bullets.forEach((bullet) => {
      this.obstacles.forEach((obstacle) => {
        if (
          !obstacle.isHit &&
          obstacle.type.includes("CACTUS") &&
          this.isColliding(bullet, obstacle)
        ) {
          bullet.remove = true;
          obstacle.isHit = true;
          const text = "+2";
          this.dino.runner.floatingTexts.push(
            new FloatingText(
              obstacle.xPos,
              obstacle.yPos,
              text,
              bullet.type === "fire" ? colors.GOLD : colors.GREEN,
              2
            )
          );
          if (bullet.type === "fire") {
            this.dino.dollarCount += Dino.config.BASE_$_REWARD;
          } else {
            this.dino.leafCount += Dino.config.BASE_LEAF_REWARD;
          }
        }
      });
    });

    this.dino.bullets = this.dino.bullets.filter((bullet) => !bullet.remove);
    this.obstacles = this.obstacles.filter((obstacle) => !obstacle.remove);

    this.obstacles.forEach((obstacle) => {
      const isColliding = this.isCollidingWithDino(obstacle);
      if (!obstacle.isHit && isColliding) {
        obstacle.isHit = true;
        console.log("COLLISION", obstacle.type);
        if (obstacle.type === "STORE") {
          this.runner.isPaused = true;
          this.runner.modalManager.show("store");
        } else if (obstacle.type === "CLOUD") {
          const text = "+2";
          const waterText = new FloatingText(
            obstacle.xPos,
            obstacle.yPos,
            text,
            colors.BLUE
          );
          this.runner.floatingTexts.push(waterText);
          this.dino.waterAmmoCount = Math.min(
            this.dino.waterAmmoCount + 2,
            this.dino.maxWaterAmmo
          );
        } else if (obstacle.type === "GAS") {
          obstacle.remove = true;
          const text = "+2";
          const gasText = new FloatingText(
            obstacle.xPos,
            obstacle.yPos,
            text,
            colors.RED,
            this.runner.speed - 1
          );
          this.runner.floatingTexts.push(gasText);
          this.dino.gasCount = Math.min(
            this.dino.gasCount + 2,
            this.dino.maxGasCount
          );
        }
      }
    });
  }

  isColliding(bullet, obstacle) {
    return (
      bullet.x < obstacle.xPos + obstacle.width &&
      bullet.x + bullet.width > obstacle.xPos &&
      bullet.y < obstacle.yPos + obstacle.height &&
      bullet.y + bullet.height > obstacle.yPos
    );
  }

  isCollidingWithDino(entity) {
    return (
      this.dino.xPos < entity.xPos + entity.width &&
      this.dino.xPos + Dino.config.WIDTH > entity.xPos &&
      this.dino.yPos < entity.yPos + entity.height &&
      this.dino.yPos + Dino.config.HEIGHT > entity.yPos
    );
  }

  update() {
    const speed = 2;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.horizonLine.update(speed);
    this.checkCollisions();

    // Remove obstacles that are marked for removal
    this.obstacles = this.obstacles.filter((obstacle) => !obstacle.remove);

    this.obstacleSpawnTimer++;
    if (this.obstacleSpawnTimer > getRandomNum(150, 300)) {
      this.obstacles.push(
        new Obstacle(this.canvas, this.ctx, this.spriteSheet, "STORE")
      );
      // const roll = Math.random();
      // if (roll < 0.6) {
      //   this.obstacles.push(
      //     new Obstacle(this.canvas, this.ctx, this.spriteSheet, "CACTUS")
      //   ); // 60% chance for cactus
      // } else if (roll < 0.8) {
      //   this.obstacles.push(
      //     new Obstacle(this.canvas, this.ctx, this.spriteSheet, "CLOUD")
      //   ); // 20% chance for cloud
      // } else if (roll < 0.9) {
      //   this.obstacles.push(
      //     new Obstacle(this.canvas, this.ctx, this.spriteSheet, "STORE")
      //   ); // 10% chance for store
      // } else {
      //   this.obstacles.push(
      //     new Obstacle(this.canvas, this.ctx, this.spriteSheet, "GAS")
      //   ); // 10% chance for gas
      // }
      this.obstacleSpawnTimer = 0;
    }

    this.obstacles.forEach((obstacle) => obstacle.update());

    this.draw();
  }

  draw() {
    this.obstacles.forEach((obstacle) => obstacle.draw());
    this.horizonLine.draw();
  }
}

class Bullet {
  constructor(canvas, ctx, x, y, width, height, type = "water") {
    this.canvas = canvas;
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.remove = false;
    this.type = type;
  }

  update(speed) {
    if (!this.remove) {
      this.x += speed;
      return this.x < this.canvas.width;
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.type === "water" ? colors.BLUE : colors.RED;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

// Initialize game
window.onload = () => {
  const game = new Runner();
};
