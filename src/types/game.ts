export interface Point {
  x: number;
  y: number;
}

export interface Player {
  health: number;
  money: number;
}

export interface Enemy {
  id: string;
  type: string;
  layer: number;
  health: number;
  speed: number;
  cashPrize: number;
  position: Point;
  target: number;
  distance: number;
  pathProgress: number;  // Progress along current path segment (0-1)
  totalDistance: number; // Total distance traveled along path
  angle: number;
  effects?: {
    slow?: number;
    dot?: number;
    duration?: number;
  };
  isCamo?: boolean;
  isRegrow?: boolean;
  isMoab?: boolean;
  children?: string[];
}

export type TargetingMode = 'First' | 'Last' | 'Strong' | 'Close';

export interface Tower {
  id: string;
  type: string;
  position: Point;
  cost: number;
  fireRate: number;
  range: number;
  damage: number;
  targetTimer: number;
  angle: number;
  targetingMode: 'First';
  upgrades: {
    path1: number;
    path2: number;
  };
  special?: {
    pierce?: number;
    splashRadius?: number;
    slowEffect?: number;
    dotEffect?: number;
    detectCamo?: boolean;
    seeking?: boolean;
    distraction?: number;
    projectileSpeed?: number;
    moabDamage?: number;
    freezeDuration?: number;
    freezeDamage?: boolean;
    permafrost?: number;
    freezeImmune?: boolean;
    grapeShot?: boolean;
  };
}

export interface TowerInfo {
  cost: number;
  fireRate: number;
  range: number;
  damage: number;
  upgrades?: {
    path1: {
      name: string;
      cost: number;
      description: string;
      effects: Partial<Tower>;
    }[];
    path2: {
      name: string;
      cost: number;
      description: string;
      effects: Partial<Tower>;
    }[];
  };
}

export interface Bullet {
  id: string;
  position: Point;
  target: Point;
  damage: number;
  speed: number;
  size: number;
  color: string;
  angle: number;
  effects?: {
    slow?: number;
    dot?: number;
  };
  splashRadius?: number;
}

export interface GameState {
  player: Player;
  enemies: Enemy[];
  towers: Tower[];
  bullets: Bullet[];
  wave: number;
  isPlaying: boolean;
}

export const TOWER_TYPES: Record<string, TowerInfo> = {
  'Dart Monkey': {
    cost: 215,
    fireRate: 1.3,
    range: 100,
    damage: 1,
    upgrades: {
      path1: [
        {
          name: 'Sharp Darts',
          cost: 140,
          description: 'Can pop 2 bloons per shot',
          effects: { special: { pierce: 2 } }
        },
        {
          name: 'Razor Sharp Darts',
          cost: 220,
          description: 'Can pop 3 bloons per shot',
          effects: { special: { pierce: 3 } }
        }
      ],
      path2: [
        {
          name: 'Long Range Darts',
          cost: 90,
          description: 'Increased range',
          effects: { range: 125 }
        },
        {
          name: 'Enhanced Eyesight',
          cost: 120,
          description: 'Further increased range',
          effects: { range: 150 }
        }
      ]
    }
  },
  'Tack Shooter': {
    cost: 360,
    fireRate: 1.0,
    range: 70,
    damage: 1,
    upgrades: {
      path1: [
        {
          name: 'Faster Shooting',
          cost: 210,
          description: 'Shoots tacks faster',
          effects: { fireRate: 0.8 }
        },
        {
          name: 'Even Faster Shooting',
          cost: 300,
          description: 'Shoots even faster',
          effects: { fireRate: 0.6 }
        }
      ],
      path2: [
        {
          name: 'Extra Range',
          cost: 100,
          description: 'Increased range',
          effects: { range: 85 }
        },
        {
          name: 'Super Range',
          cost: 225,
          description: 'Even more range',
          effects: { range: 100 }
        }
      ]
    }
  },
  'Sniper Monkey': {
    cost: 430,
    fireRate: 2.9,
    range: 300,
    damage: 2,
    upgrades: {
      path1: [
        {
          name: 'Point Five Oh',
          cost: 400,
          description: 'Increased damage to MOAB class bloons',
          effects: { damage: 4 }
        },
        {
          name: 'Full Metal Jacket',
          cost: 850,
          description: 'Even more damage to all bloon types',
          effects: { damage: 6 }
        }
      ],
      path2: [
        {
          name: 'Faster Firing',
          cost: 300,
          description: 'Shoots faster',
          effects: { fireRate: 2.0 }
        },
        {
          name: 'Night Vision Goggles',
          cost: 350,
          description: 'Can detect camo bloons',
          effects: { special: { detectCamo: true } }
        }
      ]
    }
  },
  'Boomerang Thrower': { cost: 430, fireRate: 1.0, range: 90, damage: 1 },
  'Ninja Monkey': {
    cost: 500,
    fireRate: 0.7,
    range: 120,
    damage: 1,
    upgrades: {
      path1: [
        {
          name: 'Ninja Discipline',
          cost: 300,
          description: 'Increased attack speed and range',
          effects: { fireRate: 0.5, range: 140 }
        },
        {
          name: 'Sharp Shurikens',
          cost: 400,
          description: 'Shurikens can pop 4 bloons each',
          effects: { special: { pierce: 4 } }
        }
      ],
      path2: [
        {
          name: 'Seeking Shuriken',
          cost: 350,
          description: 'Shurikens seek out bloons',
          effects: { special: { seeking: true } }
        },
        {
          name: 'Distraction',
          cost: 450,
          description: 'Bloons may be sent back to the start',
          effects: { special: { distraction: 0.2 } }
        }
      ]
    }
  },
  'Bomb Tower': {
    cost: 650,
    fireRate: 1.5,
    range: 90,
    damage: 1,
    upgrades: {
      path1: [
        {
          name: 'Bigger Bombs',
          cost: 400,
          description: 'Explosions affect a larger area',
          effects: { special: { splashRadius: 45 } }
        },
        {
          name: 'Extra Range',
          cost: 250,
          description: 'Increased attack range',
          effects: { range: 110 }
        }
      ],
      path2: [
        {
          name: 'Missile Launcher',
          cost: 500,
          description: 'Shoots missiles that move faster',
          effects: { special: { projectileSpeed: 1.5 } }
        },
        {
          name: 'MOAB Mauler',
          cost: 900,
          description: 'Does extra damage to MOAB class bloons',
          effects: { special: { moabDamage: 10 } }
        }
      ]
    }
  },
  'Ice Tower': {
    cost: 380,
    fireRate: 1.2,
    range: 80,
    damage: 1,
    upgrades: {
      path1: [
        {
          name: 'Enhanced Freeze',
          cost: 225,
          description: 'Freezes bloons for longer',
          effects: { special: { freezeDuration: 2.5 } }
        },
        {
          name: 'Snap Freeze',
          cost: 400,
          description: 'Can pop bloons while freezing',
          effects: { damage: 1, special: { freezeDamage: true } }
        }
      ],
      path2: [
        {
          name: 'Permafrost',
          cost: 300,
          description: 'Slows bloons permanently after thaw',
          effects: { special: { permafrost: 0.5 } }
        },
        {
          name: 'Deep Freeze',
          cost: 450,
          description: 'Can freeze white and zebra bloons',
          effects: { special: { freezeImmune: true } }
        }
      ]
    }
  },
  'Glue Gunner': { cost: 325, fireRate: 1.1, range: 100, damage: 1 },
  'Monkey Buccaneer': {
    cost: 550,
    fireRate: 1.0,
    range: 110,
    damage: 1,
    upgrades: {
      path1: [
        {
          name: 'Faster Shooting',
          cost: 300,
          description: 'Shoots faster',
          effects: { fireRate: 0.7 }
        },
        {
          name: 'Grape Shot',
          cost: 500,
          description: 'Adds grapes that do extra damage',
          effects: { special: { grapeShot: true } }
        }
      ],
      path2: [
        {
          name: 'Longer Range',
          cost: 200,
          description: 'Increased attack range',
          effects: { range: 130 }
        },
        {
          name: 'Crow\'s Nest',
          cost: 400,
          description: 'Can detect camo bloons',
          effects: { special: { detectCamo: true } }
        }
      ]
    }
  },
  'Super Monkey': {
    cost: 2500,
    fireRate: 0.05,
    range: 140,
    damage: 1,
    upgrades: {
      path1: [
        {
          name: 'Laser Vision',
          cost: 1500,
          description: 'Shoots powerful laser beams',
          effects: { damage: 2 }
        },
        {
          name: 'Plasma Vision',
          cost: 3000,
          description: 'Shoots even more powerful plasma',
          effects: { damage: 3, fireRate: 0.03 }
        }
      ],
      path2: [
        {
          name: 'Super Range',
          cost: 1000,
          description: 'Greatly increased range',
          effects: { range: 180 }
        },
        {
          name: 'Epic Range',
          cost: 1500,
          description: 'Even more range',
          effects: { range: 220 }
        }
      ]
    }
  },
  'Monkey Apprentice': { cost: 595, fireRate: 1.0, range: 60, damage: 1 },
  'Spike Factory': { cost: 650, fireRate: 2.0, range: 40, damage: 1 },
  'Road Spikes': { cost: 30, fireRate: 5.0, range: 40, damage: 1 },
  'Exploding Pineapple': { cost: 25, fireRate: 2.0, range: 60, damage: 1 },
}; 