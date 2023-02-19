const canvas = document.querySelector("canvas");

canvas.width = innerWidth;
canvas.height = innerHeight;

const c = canvas.getContext("2d");

const playerCoords = {
  x: canvas.width / 2,
  y: canvas.height / 2,
};

const mouseCoords = {
  x: null,
  y: null,
};

////////////////////////////////////////////////////// Helpers /////////////////////////////////////////////////////////////////

function spawnEnemies() {
  setInterval(() => {
    const radius = Math.floor(Math.random() * 30) + 15;
    let x;
    let y;
    if (Math.random() < 0.5) {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    } else {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    }
    const angle = getAngle(y, player.y, x, player.x);
    const velocity = getVelocity(angle);
    const color = `${Math.random() * 360}, 50%, 50%`;

    enemies.push(new Enemy(x, y, radius, color, 1, velocity));
  }, 1000);
}
spawnEnemies();

function getAngle(y2, y1, x2, x1) {
  return (angle = Math.atan2(y2 - y1, x2 - x1));
}
function getVelocity(angle) {
  return {
    vx: Math.cos(angle),
    vy: Math.sin(angle),
  };
}

function createExplosion(enemy) {
  for (let i = 0; i < 8; i++) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = getVelocity(angle);
    explosions.push(
      new Explosion(
        enemy.x,
        enemy.y,
        Math.random() * 3,
        enemy.color,
        1,
        velocity
      )
    );
  }
}

////////////////////////////////////////////////////// Classes /////////////////////////////////////////////////////////////////

class Circle {
  constructor(x, y, radius, color, alpha) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.alpha = alpha;
  }
  draw() {
    c.beginPath();
    c.fillStyle = `hsla(${this.color}, ${this.alpha})`;
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    c.fill();
  }
}

class Player extends Circle {
  constructor(x, y, radius, color, alpha, velocity) {
    super(x, y, radius, color, alpha);
    this.velocity = velocity;
  }
  update() {
    this.velocity.vx = this.velocity.vx * 0.99;
    this.velocity.vy = this.velocity.vy * 0.99;
    this.x = this.x + this.velocity.vx;
    this.y = this.y + this.velocity.vy;
    this.draw();
  }
}

class Projectile extends Circle {
  constructor(x, y, radius, color, alpha, velocity) {
    super(x, y, radius, color, alpha);
    this.velocity = velocity;
    this.velocity.vx = this.velocity.vx * 10;
    this.velocity.vy = this.velocity.vy * 10;
  }
  update() {
    this.x = this.x + this.velocity.vx;
    this.y = this.y + this.velocity.vy;
    this.draw();
  }
  checkOffScreen() {
    if (
      this.x > canvas.width ||
      this.x < 0 ||
      this.y > canvas.height ||
      this.y < 0
    )
      return true;
    else return false;
  }
}

class Enemy extends Circle {
  constructor(x, y, radius, color, alpha, velocity) {
    super(x, y, radius, color, alpha);
    this.velocity = velocity;
  }
  update() {
    this.x = this.x - this.velocity.vx * 2;
    this.y = this.y - this.velocity.vy * 2;
    this.draw();
  }
  getDistance(projectileX, projectileY) {
    const dx = this.x - projectileX;
    const dy = this.y - projectileY;
    return Math.sqrt(dx ** 2 + dy ** 2);
  }
}

class Explosion extends Circle {
  constructor(x, y, radius, color, alpha, velocity) {
    super(x, y, radius, color, alpha);
    this.velocity = velocity;
    this.velocity.vx = this.velocity.vx * Math.random() * 2;
    this.velocity.vy = this.velocity.vy * Math.random() * 2;
  }
  update() {
    this.velocity.vx = this.velocity.vx * 0.99;
    this.velocity.vy = this.velocity.vy * 0.99;
    this.alpha = this.alpha - 0.01;
    this.x = this.x + this.velocity.vx;
    this.y = this.y + this.velocity.vy;
    this.draw();
  }
  checkAlpha() {
    if (this.alpha < 0.01) return true;
    else return false;
  }
}

class Box {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }
  draw() {
    c.fillStyle = this.color;
    c.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Point {
  constructor(x, y, radius, color, alpha, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.alpha = alpha;
    this.velocity = velocity;
    this.friction = 0.8;
    this.ease = 0.2;
    this.originX = x;
    this.originY = y;
  }
  getDistance(projectileX, projectileY) {
    const dx = this.x - projectileX;
    const dy = this.y - projectileY;
    return Math.sqrt(dx ** 2 + dy ** 2);
  }
  draw() {
    c.beginPath();
    c.strokeStyle = `hsla(${this.color}, ${this.alpha})`;
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    c.stroke();
  }
  update() {
    this.x +=
      (this.velocity.vx *= this.friction) + (this.originX - this.x) * this.ease;
    this.y +=
      (this.velocity.vy *= this.friction) + (this.originY - this.y) * this.ease;
    this.draw();
  }
}

// //////////////////////////////////////////////////// Event Listeners ////////////////////////////////////////////////////////////

let interval;

addEventListener("mousedown", () => {
  const angle = getAngle(mouseCoords.y, player.y, mouseCoords.x, player.x);
  const velocity = getVelocity(angle);
  projectiles.push(
    new Projectile(player.x, player.y, 5, "0,0%,100%", 1, velocity)
  );
  interval = setInterval(() => {
    const angle = getAngle(mouseCoords.y, player.y, mouseCoords.x, player.x);
    const velocity = getVelocity(angle);
    projectiles.push(
      new Projectile(player.x, player.y, 5, "0,0%,100%", 1, velocity)
    );
  }, 100);
});
addEventListener("mouseup", () => {
  clearInterval(interval);
});

addEventListener("mousemove", (event) => {
  mouseCoords.x = event.clientX;
  mouseCoords.y = event.clientY;
});

const maxSpeed = 10;

addEventListener("keydown", (event) => {
  switch (event.key) {
    case "s":
      player.velocity.vy =
        player.velocity.vy < maxSpeed ? player.velocity.vy + 1 : maxSpeed;
      break;
    case "w":
      player.velocity.vy =
        player.velocity.vy > -maxSpeed ? player.velocity.vy - 1 : -maxSpeed;
      break;
    case "a":
      player.velocity.vx =
        player.velocity.vx > -maxSpeed ? player.velocity.vx - 1 : -maxSpeed;
      break;
    case "d":
      player.velocity.vx =
        player.velocity.vx < maxSpeed ? player.velocity.vx + 1 : maxSpeed;
      break;
  }
});

// ///////////////////////////////////////////////// Arrays //////////////////////////////////////////////////////////////////////

const player = new Player(playerCoords.x, playerCoords.y, 20, "0,0%,100%", 1, {
  vx: 0,
  vy: 0,
});
const projectiles = [];
const enemies = [];
const explosions = [];
const background = new Box(
  0,
  0,
  canvas.width,
  canvas.height,
  "rgba(0, 0, 0, 0.1)"
);

function animate() {
  background.draw();

  projectiles.forEach((projectile, projectileIndex) => {
    if (projectile.checkOffScreen()) {
      projectiles.splice(projectileIndex, 1);
    }
    projectile.update();

    // get distance from each projectile to each enemy
    enemies.forEach((enemy, enemyIndex) => {
      // if an enemy is hit
      if (
        enemy.getDistance(projectile.x, projectile.y) <
        enemy.radius + projectile.radius
      ) {
        enemy.radius = enemy.radius - 10;
        createExplosion(enemy);
        projectiles.splice(projectileIndex, 1);
        if (enemy.radius < 10) enemies.splice(enemyIndex, 1);
      }
    });
  });
  enemies.forEach((enemy) => {
    enemy.update();
  });
  explosions.forEach((explosion) => {
    explosion.update();
  });
  player.update();

  requestAnimationFrame(animate);
}

animate();
