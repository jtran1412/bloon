// Import tower images
import dartMonkey from '../assets/towers/dart_monkey.png';
import tackShooter from '../assets/towers/tack_shooter.png';
import sniperMonkey from '../assets/towers/sniper_monkey.png';
import boomerangThrower from '../assets/towers/boomerang_thrower.png';
import ninjaMonkey from '../assets/towers/ninja_monkey.png';
import bombTower from '../assets/towers/bomb_tower.png';
import iceTower from '../assets/towers/ice_tower.png';
import glueGunner from '../assets/towers/glue_gunner.png';
import monkeyBuccaneer from '../assets/towers/monkey_buccaneer.png';
import superMonkey from '../assets/towers/super_monkey.png';
import monkeyApprentice from '../assets/towers/monkey_apprentice.png';
import spikeFactory from '../assets/towers/spike_factory.png';
import roadSpikes from '../assets/towers/road_spikes.png';
import explodingPineapple from '../assets/towers/exploding_pineapple.png';

// Import enemy image
import bloonImage from '../assets/enemies/bloonImg.png';

// Import map images
import monkeyLaneMap from '../assets/maps/monkey-lane.png';
import monkeyLaneImage2 from '../assets/maps/image2.png';
import monkeyLaneImage3 from '../assets/maps/image3.png';

// Cache for loaded images
const imageCache: { [key: string]: HTMLImageElement } = {};

type ImageMap = {
  [key: string]: string;
};

const imageMap: ImageMap = {
  // Towers - map both formats for compatibility
  '/src/assets/towers/dart_monkey.png': dartMonkey,
  '/src/assets/towers/tack_shooter.png': tackShooter,
  '/src/assets/towers/sniper_monkey.png': sniperMonkey,
  '/src/assets/towers/boomerang_thrower.png': boomerangThrower,
  '/src/assets/towers/ninja_monkey.png': ninjaMonkey,
  '/src/assets/towers/bomb_tower.png': bombTower,
  '/src/assets/towers/ice_tower.png': iceTower,
  '/src/assets/towers/glue_gunner.png': glueGunner,
  '/src/assets/towers/monkey_buccaneer.png': monkeyBuccaneer,
  '/src/assets/towers/super_monkey.png': superMonkey,
  '/src/assets/towers/monkey_apprentice.png': monkeyApprentice,
  '/src/assets/towers/spike_factory.png': spikeFactory,
  '/src/assets/towers/road_spikes.png': roadSpikes,
  '/src/assets/towers/exploding_pineapple.png': explodingPineapple,

  // Also map with spaces for compatibility
  '/src/assets/towers/dart monkey.png': dartMonkey,
  '/src/assets/towers/tack shooter.png': tackShooter,
  '/src/assets/towers/sniper monkey.png': sniperMonkey,
  '/src/assets/towers/boomerang thrower.png': boomerangThrower,
  '/src/assets/towers/ninja monkey.png': ninjaMonkey,
  '/src/assets/towers/bomb tower.png': bombTower,
  '/src/assets/towers/ice tower.png': iceTower,
  '/src/assets/towers/glue gunner.png': glueGunner,
  '/src/assets/towers/monkey buccaneer.png': monkeyBuccaneer,
  '/src/assets/towers/super monkey.png': superMonkey,
  '/src/assets/towers/monkey apprentice.png': monkeyApprentice,
  '/src/assets/towers/spike factory.png': spikeFactory,
  '/src/assets/towers/road spikes.png': roadSpikes,
  '/src/assets/towers/exploding pineapple.png': explodingPineapple,

  // Enemy
  '/src/assets/enemies/bloonImg.png': bloonImage,

  // Map
  '/src/assets/maps/monkey-lane.png': monkeyLaneMap,
  '/src/assets/maps/image2.png': monkeyLaneImage2,
  '/src/assets/maps/image3.png': monkeyLaneImage3,
};

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  // Return cached image if available
  if (imageCache[src]) {
    return Promise.resolve(imageCache[src]);
  }

  // Load new image
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache[src] = img;
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = imageMap[src] || src;
  });
};

export const preloadImages = async () => {
  try {
    await Promise.all(Object.keys(imageMap).map(loadImage));
    console.log('All images loaded successfully');
  } catch (error) {
    console.error('Error loading images:', error);
  }
};

export const getImage = (path: string): HTMLImageElement | null => {
  // Try both formats (with underscore and with space)
  const underscorePath = path.replace(/ /g, '_');
  const spacePath = path.replace(/_/g, ' ');
  return imageCache[path] || imageCache[underscorePath] || imageCache[spacePath] || null;
};

export const createProjectileImage = (color: string, size: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = size * 2;
  canvas.height = size * 2;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.beginPath();
    ctx.arc(size, size, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Add a subtle gradient for 3D effect
    const gradient = ctx.createRadialGradient(size - size/3, size - size/3, 0, size, size, size);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();
  }
  
  return canvas;
}; 