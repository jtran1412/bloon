import { Point, Bullet, Tower, Enemy } from '../types/game';
import { calculateAngle } from './mechanics';

export interface ProjectileType {
  speed: number;
  size: number;
  color: string;
  splashRadius?: number;
  effects?: {
    slow?: number;
    dot?: number;
  };
}

export const PROJECTILE_TYPES: { [key: string]: ProjectileType } = {
  'Dart Monkey': {
    speed: 30,
    size: 6,
    color: '#FFD700',
  },
  'Tack Shooter': {
    speed: 24,
    size: 4,
    color: '#FF4444',
  },
  'Sniper Monkey': {
    speed: 60,
    size: 4,
    color: '#FFFF00',
  },
  'Boomerang Thrower': {
    speed: 20,
    size: 8,
    color: '#FF6B6B',
  },
  'Ninja Monkey': {
    speed: 36,
    size: 5,
    color: '#4B0082',
  },
  'Bomb Tower': {
    speed: 16,
    size: 10,
    color: '#000000',
    splashRadius: 30,
  },
  'Ice Tower': {
    speed: 0,
    size: 40,
    color: 'rgba(135, 206, 235, 0.5)',
    effects: { slow: 0.5 },
  },
  'Glue Gunner': {
    speed: 20,
    size: 6,
    color: '#98FF98',
    effects: { slow: 0.7 },
  },
  'Monkey Buccaneer': {
    speed: 24,
    size: 7,
    color: '#4169E1',
  },
  'Super Monkey': {
    speed: 50,
    size: 4,
    color: '#FFD700',
  },
  'Monkey Apprentice': {
    speed: 28,
    size: 8,
    color: '#9370DB',
  },
  'Spike Factory': {
    speed: 0,
    size: 6,
    color: '#808080',
  },
};

export const createBullet = (tower: Tower, target: Enemy): Bullet => {
  const projectileType = PROJECTILE_TYPES[tower.type];
  const angle = calculateAngle(tower.position, target.position);
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    position: { ...tower.position },
    target: { ...target.position },
    damage: tower.damage,
    speed: projectileType.speed,
    size: projectileType.size,
    color: projectileType.color,
    angle,
    effects: projectileType.effects,
    splashRadius: projectileType.splashRadius,
  };
};

export const updateBullet = (bullet: Bullet, frameTime: number): { bullet: Bullet; hasReachedTarget: boolean } => {
  const dx = bullet.target.x - bullet.position.x;
  const dy = bullet.target.y - bullet.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance <= bullet.speed * frameTime) {
    return { bullet, hasReachedTarget: true };
  }

  const vx = (dx / distance) * bullet.speed;
  const vy = (dy / distance) * bullet.speed;

  return {
    bullet: {
      ...bullet,
      position: {
        x: bullet.position.x + vx * frameTime,
        y: bullet.position.y + vy * frameTime,
      },
      angle: calculateAngle(bullet.position, bullet.target),
    },
    hasReachedTarget: false,
  };
}; 