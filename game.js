// Utilities
function getRandomNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const colors = {
  BLUE: "#3498db",
  GREEN: "#2ecc71",
  RED: "#e74c3c",
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
    this.horizon.addCloud();

    this.speed = 2;
    this.dino = new Dino(this.canvas, this.ctx, this.spriteSheet);
    this.dino.runner = this;
    this.horizon.dino = this.dino;
    this.horizon.runner = this;

    this.gameLoop();
    this.drawInfo();
  }

  update() {
    this.floatingTexts = this.floatingTexts.filter((text) => !text.remove);
    this.floatingTexts.forEach((text) => text.update());

    this.horizon.update();
    this.dino.update();
    this.drawInfo();

    this.floatingTexts.forEach((text) => text.draw(this.ctx));
  }

  gameLoop() {
    this.update();
    requestAnimationFrame(() => this.gameLoop());
  }

  drawInfo() {
    const startX = this.canvas.width - 120; // Start position from right side
    const startY = 20;
    const leafCountY = startY + 20;

    this.ctx.save();
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "middle";

    // Water ammo counter
    this.ctx.fillStyle = "#3498db";
    this.ctx.font = '16px "Press Start 2P", monospace';
    this.ctx.fillText("💧", startX, startY);

    this.ctx.font = '12px "Press Start 2P", monospace';
    this.ctx.fillText(
      `${this.dino.waterAmmoCount} / ${this.dino.maxWaterAmmo}`,
      startX + 25,
      startY
    );

    // Gas counter
    this.ctx.fillStyle = colors.RED;
    this.ctx.font = '16px "Press Start 2P", monospace';
    this.ctx.fillText("⛽️", startX, startY + 40);

    this.ctx.font = '12px "Press Start 2P", monospace';
    this.ctx.fillText(
      `${this.dino.gasCount} / ${this.dino.maxGasCount}`,
      startX + 25,
      startY + 40
    );

    // Leaf counter
    this.ctx.fillStyle = "#2ecc71";
    this.ctx.font = '16px "Press Start 2P", monospace';
    this.ctx.fillText("🍃", startX, leafCountY);

    this.ctx.font = '12px "Press Start 2P", monospace';
    this.ctx.fillText(this.dino.leafCount, startX + 25, leafCountY);

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

class Cloud {
  static config = {
    HEIGHT: 14,
    WIDTH: 46,
    SPRITE_X: 86,
    SPRITE_Y: 2,
    MIN_SPEED: 1,
    MAX_SPEED: 3,
    MIN_Y: 10,
    MAX_Y: 80,
  };

  constructor(canvas, ctx, spriteSheet) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.spriteSheet = spriteSheet;
    this.xPos = this.canvas.width;
    this.yPos = getRandomNum(Cloud.config.MIN_Y, Cloud.config.MAX_Y);
    this.remove = false;
    this.speed =
      getRandomNum(Cloud.config.MIN_SPEED, Cloud.config.MAX_SPEED) / 2;
    this.isTouched = false;
  }

  draw() {
    this.ctx.save();

    // Draw highlight if cloud is highlighted
    if (this.isTouched) {
      this.ctx.globalAlpha = 0.1;
      this.ctx.fillStyle = colors.BLUE;
      this.ctx.fillRect(
        this.xPos,
        this.yPos,
        Cloud.config.WIDTH,
        Cloud.config.HEIGHT
      );
    }

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
    MAX_OBSTACLE_LENGTH: 3,
    MIN_SPEED: 2,
    SPEED_OFFSET: 0.8,
  };

  constructor(canvas, ctx, spriteSheet) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.spriteSheet = spriteSheet;
    this.size =
      Math.floor(Math.random() * Obstacle.config.MAX_OBSTACLE_LENGTH) + 1;

    // Randomly choose between small and large cactus
    this.type =
      Math.random() > 0.5
        ? Obstacle.config.CACTUS_SMALL
        : Obstacle.config.CACTUS_LARGE;

    this.width = this.type.WIDTH * this.size;
    this.height = this.type.HEIGHT;
    this.xPos = this.canvas.width;
    this.yPos = this.canvas.height - this.height - 12; // 12 is ground height
    this.remove = false;
    this.speed = Obstacle.config.MIN_SPEED;
    this.isHit = false;
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
        this.type.SPRITE_X,
        this.type.SPRITE_Y,
        this.type.WIDTH,
        this.type.HEIGHT,
        this.xPos + i * this.type.WIDTH,
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
    this.clouds = [];
    this.horizonLine = new HorizonLine(this.canvas, this.ctx, this.spriteSheet);
    this.cloudSpawnTimer = 0;
    this.obstacles = [];
    this.obstacleSpawnTimer = 0;
    this.gases = [];
    this.gasSpawnTimer = 0;
  }

  addCloud() {
    this.clouds.push(new Cloud(this.canvas, this.ctx, this.spriteSheet));
  }

  addObstacle() {
    this.obstacles.push(new Obstacle(this.canvas, this.ctx, this.spriteSheet));
  }

  addGas() {
    this.gases.push(
      new Gas(this.canvas, this.ctx, this.spriteSheet, this.runner.speed)
    );
  }

  checkCollisions() {
    this.dino.bullets.forEach((bullet) => {
      this.obstacles.forEach((obstacle) => {
        if (!obstacle.isHit && this.isColliding(bullet, obstacle)) {
          bullet.remove = true;
          obstacle.isHit = true;
          const text = "+2";
          this.dino.runner.floatingTexts.push(
            new FloatingText(obstacle.xPos, obstacle.yPos, text, "#2ecc71", 2)
          );
          this.dino.leafCount += Dino.config.BASE_LEAF_REWARD;
        }
      });
    });

    this.dino.bullets = this.dino.bullets.filter((bullet) => !bullet.remove);
    this.obstacles = this.obstacles.filter((obstacle) => !obstacle.remove);

    // Add cloud collision detection
    this.clouds.forEach((cloud) => {
      if (!cloud.isTouched && this.isCollidingWithDino(cloud)) {
        cloud.isTouched = true;
        const text = "+2";
        const waterText = new FloatingText(
          cloud.xPos,
          cloud.yPos,
          text,
          colors.BLUE
        );
        this.runner.floatingTexts.push(waterText);
        this.dino.waterAmmoCount = Math.min(
          this.dino.waterAmmoCount + 2,
          this.dino.maxWaterAmmo
        );
      }
    });

    // Add gas collision detection
    this.gases.forEach((gas) => {
      if (!gas.isTouched && this.isCollidingWithDino(gas)) {
        gas.isTouched = true;
        gas.remove = true;
        const text = "+2";
        const gasText = new FloatingText(
          gas.xPos,
          gas.yPos,
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
      this.dino.xPos < entity.xPos + entity.constructor.config.WIDTH &&
      this.dino.xPos + Dino.config.WIDTH > entity.xPos &&
      this.dino.yPos < entity.yPos + entity.constructor.config.HEIGHT &&
      this.dino.yPos + Dino.config.HEIGHT > entity.yPos
    );
  }

  update() {
    const speed = 2;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.horizonLine.update(speed);
    this.checkCollisions();

    // Remove clouds and obstacles that are marked for removal
    this.clouds = this.clouds.filter((cloud) => !cloud.remove);
    this.obstacles = this.obstacles.filter((obstacle) => !obstacle.remove);

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

    // Manage gas clouds
    this.gases = this.gases.filter((gas) => !gas.remove);
    this.gasSpawnTimer++;
    if (this.gasSpawnTimer > getRandomNum(100, 200)) {
      this.addGas();
      this.gasSpawnTimer = 0;
    }

    this.clouds.forEach((cloud) => cloud.update());
    this.obstacles.forEach((obstacle) => obstacle.update());
    this.gases.forEach((gas) => gas.update());

    this.draw();
  }

  draw() {
    this.clouds.forEach((cloud) => cloud.draw());
    this.gases.forEach((gas) => gas.draw()); // Draw gases before obstacles
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

// Add this new class
class Gas {
  static config = {
    HEIGHT: 23,
    WIDTH: 47,
    MIN_SPEED: 1,
    MAX_SPEED: 3,
    MIN_Y: 30,
    MAX_Y: 100,
    SPRITE_X: 1233,
    SPRITE_Y: 11,
  };

  constructor(canvas, ctx, spriteSheet, speed) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.spriteSheet = spriteSheet;
    this.xPos = this.canvas.width;
    this.yPos = this.canvas.height - Gas.config.HEIGHT - 12;
    this.remove = false;
    this.speed = speed;
    this.isTouched = false;
  }

  draw() {
    this.ctx.save();
    this.ctx.drawImage(
      this.spriteSheet,
      Gas.config.SPRITE_X,
      Gas.config.SPRITE_Y,
      Gas.config.WIDTH,
      Gas.config.HEIGHT,
      this.xPos,
      this.yPos,
      Gas.config.WIDTH,
      Gas.config.HEIGHT
    );
    this.ctx.restore();
  }

  update() {
    if (!this.remove) {
      this.xPos -= this.speed;
      this.opacity = Math.max(0, this.opacity - 0.005); // Slowly fade out
      this.draw();

      if (!this.isVisible() || this.opacity <= 0) {
        this.remove = true;
      }
    }
  }

  isVisible() {
    return this.xPos + Gas.config.WIDTH > 0;
  }
}

// Initialize game
window.onload = () => {
  const game = new Runner();
};
