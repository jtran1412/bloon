import { Enemy, Point, Tower } from '../types/game';
import { BLOON_TYPES } from './wave';

export const calculateDistance = (point1: Point, point2: Point): number => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const calculateAngle = (point1: Point, point2: Point): number => {
  return Math.atan2(point2.y - point1.y, point2.x - point1.x);
};

export const createTower = (type: string, position: Point, info: { cost: number; fireRate: number; range: number; damage: number }): Tower => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    type,
    position,
    cost: info.cost,
    fireRate: info.fireRate,
    range: info.range,
    damage: info.damage,
    targetTimer: 0,
    angle: 0,
    targetingMode: 'First' as const,
    upgrades: {
      path1: 0,
      path2: 0
    }
  };
};

export const moveEnemy = (enemy: Enemy, path: Point[], frameTime: number): Enemy => {
  // Calculate the current and next waypoint
  const currentPoint = path[enemy.target];
  const nextPoint = path[Math.min(enemy.target + 1, path.length - 1)];
  
  // Calculate direction vector between points
  const dx = nextPoint.x - currentPoint.x;
  const dy = nextPoint.y - currentPoint.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Base speed adjusted by effects
  const speed = (enemy.speed * 2) * (enemy.effects?.slow ? (1 - enemy.effects.slow) : 1);
  
  // If we've reached the next waypoint
  if (enemy.pathProgress >= 1) {
    enemy.target++;
    if (enemy.target >= path.length - 1) {
      return enemy; // Reached the end
    }
    // Reset progress for next segment
    enemy.pathProgress = 0;
    // Update angle towards next waypoint
    enemy.angle = calculateAngle(path[enemy.target], path[enemy.target + 1]);
  } else {
    // Update progress along current segment
    const step = (speed * frameTime) / distance;
    enemy.pathProgress = Math.min(enemy.pathProgress + step, 1);
    
    // Interpolate position along path
    enemy.position = {
      x: currentPoint.x + dx * enemy.pathProgress,
      y: currentPoint.y + dy * enemy.pathProgress
    };
    
    // Update total distance and angle
    enemy.totalDistance += speed * frameTime;
    enemy.angle = Math.atan2(dy, dx);
  }

  // Update effects
  if (enemy.effects?.duration) {
    enemy.effects.duration -= frameTime;
    if (enemy.effects.duration <= 0) {
      enemy.effects = {};
    }
  }

  // Handle regrow
  if (enemy.isRegrow && enemy.health < enemy.layer) {
    enemy.health += frameTime * 0.5; // Regrow at 0.5 health per second
    if (enemy.health > enemy.layer) {
      enemy.health = enemy.layer;
    }
  }

  return enemy;
};

const findTarget = (tower: Tower, enemies: Enemy[]): Enemy | null => {
  // Filter valid targets
  const validTargets = enemies.filter(enemy => {
    if (enemy.isCamo && !tower.special?.detectCamo) return false;
    const distance = calculateDistance(tower.position, enemy.position);
    return distance <= tower.range;
  });

  if (validTargets.length === 0) return null;

  switch (tower.targetingMode) {
    case 'First':
      return validTargets.reduce((first, current) => 
        current.distance > first.distance ? current : first
      );

    case 'Last':
      return validTargets.reduce((last, current) => 
        current.distance < last.distance ? current : last
      );

    case 'Strong':
      return validTargets.reduce((strongest, current) => {
        // Compare by layer first, then by current health
        if (current.layer > strongest.layer) return current;
        if (current.layer === strongest.layer && current.health > strongest.health) return current;
        return strongest;
      });

    case 'Close':
      return validTargets.reduce((closest, current) => {
        const closestDist = calculateDistance(tower.position, closest.position);
        const currentDist = calculateDistance(tower.position, current.position);
        return currentDist < closestDist ? current : closest;
      });

    default:
      return validTargets[0];
  }
};

export const updateTower = (
  tower: Tower,
  enemies: Enemy[],
  frameTime: number
): { tower: Tower; hitEnemy: Enemy | null } => {
  tower.targetTimer -= frameTime;

  if (tower.targetTimer <= 0) {
    const target = findTarget(tower, enemies);
    
    if (target) {
      tower.targetTimer = tower.fireRate;
      tower.angle = calculateAngle(tower.position, target.position);
      return { tower, hitEnemy: target };
    }
  }

  return { tower, hitEnemy: null };
};

export const createChildBloons = (enemy: Enemy): Enemy[] => {
  const children: Enemy[] = [];
  
  if (enemy.children && enemy.children.length > 0) {
    enemy.children.forEach(childType => {
      const bloonType = BLOON_TYPES[childType];
      if (bloonType) {
        const child: Enemy = {
          id: Math.random().toString(36).substr(2, 9),
          type: childType,
          layer: bloonType.health,
          health: bloonType.health,
          speed: bloonType.speed,
          cashPrize: bloonType.cashPrize,
          position: { ...enemy.position },
          target: enemy.target,
          distance: enemy.distance,
          pathProgress: enemy.pathProgress,  // Inherit parent's path progress
          totalDistance: enemy.totalDistance,  // Inherit parent's total distance
          angle: enemy.angle,
          effects: {},
          isCamo: enemy.isCamo,
          isRegrow: enemy.isRegrow,
          isMoab: bloonType.isMoab || false,
          children: bloonType.children
        };
        children.push(child);
      }
    });
  }

  return children;
};

export const isValidTowerPlacement = (position: Point, towers: Tower[], path: Point[]): boolean => {
  // Check if too close to other towers (prevent overlapping)
  const MIN_TOWER_SPACING = 30;
  const towerOverlap = towers.some(tower => 
    calculateDistance(position, tower.position) < MIN_TOWER_SPACING
  );
  if (towerOverlap) return false;

  // Check if on or near path using line segments
  const PATH_MARGIN = 30; // Reduced from 40 to make it stricter
  for (let i = 0; i < path.length - 1; i++) {
    const start = path[i];
    const end = path[i + 1];
    
    // Calculate distance to line segment
    const A = position.x - start.x;
    const B = position.y - start.y;
    const C = end.x - start.x;
    const D = end.y - start.y;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    
    if (len_sq !== 0) {
      param = dot / len_sq;
    }

    let xx, yy;

    if (param < 0) {
      xx = start.x;
      yy = start.y;
    } else if (param > 1) {
      xx = end.x;
      yy = end.y;
    } else {
      xx = start.x + param * C;
      yy = start.y + param * D;
    }

    const distance = calculateDistance(position, { x: xx, y: yy });
    if (distance < PATH_MARGIN) return false;
  }

  // Check if within map bounds
  const MAP_MARGIN = 20;
  if (
    position.x < MAP_MARGIN ||
    position.x > 700 - MAP_MARGIN || // Updated from 800 to match actual game width
    position.y < MAP_MARGIN ||
    position.y > 500 - MAP_MARGIN  // Updated from 600 to match actual game height
  ) {
    return false;
  }

  return true;
}; 