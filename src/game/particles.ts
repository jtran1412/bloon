import { Point } from '../types/game';

export interface Particle {
  id: string;
  position: Point;
  velocity: Point;
  color: string;
  size: number;
  opacity: number;
  lifetime: number;
  maxLifetime: number;
  text?: string;
}

export const createHitParticle = (position: Point): Particle => {
  const angle = Math.random() * Math.PI * 2;
  const speed = 2 + Math.random() * 2;

  return {
    id: Math.random().toString(36).substr(2, 9),
    position: { ...position },
    velocity: {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed
    },
    color: '#FFFFFF',
    size: 3,
    opacity: 1,
    lifetime: 0,
    maxLifetime: 0.5
  };
};

export const createMoneyParticle = (position: Point, amount: number): Particle => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    position: { ...position },
    velocity: { x: 0, y: -2 },
    color: '#98FF98',
    size: 12,
    opacity: 1,
    lifetime: 0,
    maxLifetime: 1,
    text: `+$${amount}`
  };
};

export const updateParticle = (particle: Particle, frameTime: number): Particle | null => {
  particle.lifetime += frameTime;
  
  if (particle.lifetime >= particle.maxLifetime) {
    return null;
  }

  const progress = particle.lifetime / particle.maxLifetime;
  
  return {
    ...particle,
    position: {
      x: particle.position.x + particle.velocity.x * frameTime,
      y: particle.position.y + particle.velocity.y * frameTime
    },
    opacity: 1 - progress,
    size: particle.text ? particle.size : particle.size * (1 - progress)
  };
};

export const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
  ctx.save();
  ctx.globalAlpha = particle.opacity;

  if (particle.text) {
    ctx.font = `${particle.size}px Arial`;
    ctx.fillStyle = particle.color;
    ctx.textAlign = 'center';
    ctx.fillText(particle.text, particle.position.x, particle.position.y);
  } else {
    ctx.beginPath();
    ctx.fillStyle = particle.color;
    ctx.arc(particle.position.x, particle.position.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}; 