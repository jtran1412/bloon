import { Enemy } from '../types/game';
import { monkeyLaneMap } from './maps';

export interface WaveState {
  currentWave: number;
  isSpawning: boolean;
  spawnTimer: number;
  spawnIndex: number;
}

export interface BloonType {
  type: string;
  health: number;
  speed: number;
  cashPrize: number;
  children?: string[];
  isCamo?: boolean;
  isRegrow?: boolean;
  isMoab?: boolean;
}

export const BLOON_TYPES: { [key: string]: BloonType } = {
  'Red': {
    type: 'Red',
    health: 1,
    speed: 1,
    cashPrize: 1
  },
  'Blue': {
    type: 'Blue',
    health: 1,
    speed: 1.4,
    cashPrize: 2,
    children: ['Red']
  },
  'Green': {
    type: 'Green',
    health: 1,
    speed: 1.8,
    cashPrize: 3,
    children: ['Blue']
  },
  'Yellow': {
    type: 'Yellow',
    health: 1,
    speed: 3.2,
    cashPrize: 4,
    children: ['Green']
  },
  'Pink': {
    type: 'Pink',
    health: 1,
    speed: 3.5,
    cashPrize: 5,
    children: ['Yellow']
  },
  'Black': {
    type: 'Black',
    health: 1,
    speed: 1.8,
    cashPrize: 11,
    children: ['Pink', 'Pink']
  },
  'White': {
    type: 'White',
    health: 1,
    speed: 2,
    cashPrize: 11,
    children: ['Pink', 'Pink']
  },
  'Zebra': {
    type: 'Zebra',
    health: 1,
    speed: 1.8,
    cashPrize: 23,
    children: ['Black', 'White']
  },
  'Rainbow': {
    type: 'Rainbow',
    health: 1,
    speed: 1.8,
    cashPrize: 47,
    children: ['Zebra', 'Zebra']
  },
  'Ceramic': {
    type: 'Ceramic',
    health: 10,
    speed: 2.5,
    cashPrize: 95,
    children: ['Rainbow', 'Rainbow']
  },
  'MOAB': {
    type: 'MOAB',
    health: 200,
    speed: 1,
    cashPrize: 381,
    children: ['Ceramic', 'Ceramic', 'Ceramic', 'Ceramic'],
    isMoab: true
  },
  'BFB': {
    type: 'BFB',
    health: 700,
    speed: 0.5,
    cashPrize: 1525,
    children: ['MOAB', 'MOAB', 'MOAB', 'MOAB'],
    isMoab: true
  }
};

export interface Wave {
  bloons: {
    type: string;
    count: number;
    spacing?: number;
    isCamo?: boolean;
    isRegrow?: boolean;
  }[];
  delay?: number;
}

export const createWaveState = (): WaveState => ({
  currentWave: 0,
  isSpawning: false,
  spawnTimer: 0,
  spawnIndex: 0
});

export const createEnemy = (type: string, isCamo: boolean = false, isRegrow: boolean = false): Enemy => {
  const bloonType = BLOON_TYPES[type];
  const spawnPoint = monkeyLaneMap.path[0]; // Use the first point of the path as spawn
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    type,
    layer: bloonType.health,
    health: bloonType.health,
    speed: bloonType.speed,
    cashPrize: bloonType.cashPrize,
    position: { ...spawnPoint }, // Use map's spawn point
    target: 0,
    distance: 0,
    pathProgress: 0,
    totalDistance: 0,
    angle: 0,
    effects: {},
    isCamo,
    isRegrow,
    isMoab: bloonType.isMoab || false,
    children: bloonType.children || []
  };
};

export const updateWaveState = (
  waveState: WaveState,
  enemies: Enemy[],
  frameTime: number,
  waves: Wave[]
): { waveState: WaveState; newEnemies: Enemy[] } => {
  if (!waveState.isSpawning) {
    return { waveState, newEnemies: [] };
  }

  const currentWave = waves[waveState.currentWave];
  const newEnemies: Enemy[] = [];
  let updatedWaveState = { ...waveState };

  updatedWaveState.spawnTimer += frameTime;

  // Get current bloon group
  const bloonGroup = currentWave.bloons[updatedWaveState.spawnIndex];
  const spacing = bloonGroup.spacing || 1;
  
  // Spawn enemies with proper spacing
  while (updatedWaveState.spawnTimer >= spacing) {
    if (bloonGroup.count > 0) {
      const enemy = createEnemy(bloonGroup.type, bloonGroup.isCamo, bloonGroup.isRegrow);
      
      // Add slight position variation for more natural look
      const variation = (Math.random() - 0.5) * 10;
      enemy.position.y += variation;
      
      newEnemies.push(enemy);
      bloonGroup.count--;
      updatedWaveState.spawnTimer -= spacing;
    }

    if (bloonGroup.count === 0) {
      updatedWaveState.spawnIndex++;
      if (updatedWaveState.spawnIndex >= currentWave.bloons.length) {
        updatedWaveState = {
          ...updatedWaveState,
          isSpawning: false,
          spawnTimer: 0,
          spawnIndex: 0
        };
        break;
      }
    }
  }

  return { waveState: updatedWaveState, newEnemies };
}; 