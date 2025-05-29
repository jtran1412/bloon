// src/game/Utils.ts

import { Vector2 } from './Types';

export function distance(a: Vector2, b: Vector2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Add other utilities like angle calculation, collision detection, etc.
