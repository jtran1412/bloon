const fs = require('fs');
const { createCanvas } = require('canvas');

const TOWER_SIZE = 40;
const ENEMY_SIZE = 30;
const COLORS = {
  red: '#FF0000',
  blue: '#0000FF',
  green: '#00FF00',
  yellow: '#FFFF00',
};

const towers = [
  'dart_monkey',
  'tack_shooter',
  'sniper_monkey',
  'boomerang_thrower',
  'ninja_monkey',
  'bomb_tower',
  'ice_tower',
  'glue_gunner',
  'monkey_buccaneer',
  'super_monkey',
  'monkey_apprentice',
  'spike_factory',
  'road_spikes',
  'exploding_pineapple',
];

const enemies = ['red', 'blue', 'green', 'yellow'];

// Create directories if they don't exist
const dirs = [
  'src/assets/towers',
  'src/assets/enemies',
  'src/assets/maps/monkey_lane',
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Generate tower images
towers.forEach(tower => {
  const canvas = createCanvas(TOWER_SIZE, TOWER_SIZE);
  const ctx = canvas.getContext('2d');

  // Draw tower placeholder
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(TOWER_SIZE / 2, TOWER_SIZE / 2, TOWER_SIZE / 3, 0, Math.PI * 2);
  ctx.fill();

  // Add tower name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '8px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(tower.split('_')[0], TOWER_SIZE / 2, TOWER_SIZE / 2 + 3);

  // Save image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`src/assets/towers/${tower}.png`, buffer);
});

// Generate enemy images
enemies.forEach(enemy => {
  const canvas = createCanvas(ENEMY_SIZE, ENEMY_SIZE);
  const ctx = canvas.getContext('2d');

  // Draw balloon
  ctx.fillStyle = COLORS[enemy];
  ctx.beginPath();
  ctx.arc(ENEMY_SIZE / 2, ENEMY_SIZE / 2, ENEMY_SIZE / 3, 0, Math.PI * 2);
  ctx.fill();

  // Save image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`src/assets/enemies/${enemy}_bloon.png`, buffer);
});

// Generate map images
const mapCanvas = createCanvas(800, 600);
const mapCtx = mapCanvas.getContext('2d');

// Background
mapCtx.fillStyle = '#90EE90';
mapCtx.fillRect(0, 0, 800, 600);
const bgBuffer = mapCanvas.toBuffer('image/png');
fs.writeFileSync('src/assets/maps/monkey_lane/background.png', bgBuffer);

// Path
mapCtx.clearRect(0, 0, 800, 600);
mapCtx.fillStyle = '#8B4513';
mapCtx.beginPath();
mapCtx.moveTo(0, 300);
mapCtx.lineTo(200, 300);
mapCtx.lineTo(300, 200);
mapCtx.lineTo(500, 200);
mapCtx.lineTo(600, 300);
mapCtx.lineTo(800, 300);
mapCtx.lineWidth = 40;
mapCtx.strokeStyle = '#8B4513';
mapCtx.stroke();
const pathBuffer = mapCanvas.toBuffer('image/png');
fs.writeFileSync('src/assets/maps/monkey_lane/path.png', pathBuffer);

console.log('Generated placeholder images successfully!'); 