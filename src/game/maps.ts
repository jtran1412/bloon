import { Point } from '../types/game';
import { Wave } from './wave';

export interface GameMap {
  path: Point[];
  waves: Wave[];
}

// Try to load saved path, fallback to default if none exists
const loadSavedPath = (): Point[] => {
  try {
    const savedPath = localStorage.getItem('monkeyLanePath');
    if (savedPath) {
      return JSON.parse(savedPath);
    }
  } catch (error) {
    console.error('Failed to load saved path:', error);
  }
  
  // Default path if no saved path exists
  return [
    { x: 0, y: 250 },
    { x: 200, y: 250 },
    { x: 200, y: 100 },
    { x: 500, y: 100 },
    { x: 500, y: 400 },
    { x: 700, y: 400 }
  ];
};

export const monkeyLaneMap: GameMap = {
  path: loadSavedPath(),
  waves: [
    {
      bloons: [
        { type: 'Red', count: 20, spacing: 1 }
      ]
    },
    {
      bloons: [
        { type: 'Red', count: 30, spacing: 0.8 },
        { type: 'Blue', count: 15, spacing: 1 }
      ]
    },
    {
      bloons: [
        { type: 'Red', count: 25, spacing: 0.7 },
        { type: 'Blue', count: 20, spacing: 0.8 },
        { type: 'Green', count: 10, spacing: 1 }
      ]
    },
    {
      bloons: [
        { type: 'Blue', count: 30, spacing: 0.7 },
        { type: 'Green', count: 15, spacing: 0.8 }
      ]
    },
    {
      bloons: [
        { type: 'Green', count: 30, spacing: 0.6 },
        { type: 'Yellow', count: 10, spacing: 0.8 }
      ]
    },
    {
      bloons: [
        { type: 'Yellow', count: 25, spacing: 0.5 },
        { type: 'Pink', count: 10, spacing: 0.7 }
      ]
    },
    {
      bloons: [
        { type: 'Pink', count: 30, spacing: 0.4 },
        { type: 'Black', count: 5, spacing: 1 }
      ]
    },
    {
      bloons: [
        { type: 'Black', count: 15, spacing: 0.8 },
        { type: 'White', count: 15, spacing: 0.8 }
      ]
    },
    {
      bloons: [
        { type: 'White', count: 20, spacing: 0.7 },
        { type: 'Zebra', count: 8, spacing: 1 }
      ]
    },
    {
      bloons: [
        { type: 'Rainbow', count: 10, spacing: 1.2 }
      ]
    },
    {
      bloons: [
        { type: 'Rainbow', count: 15, spacing: 1 },
        { type: 'Ceramic', count: 3, spacing: 2 }
      ]
    },
    {
      bloons: [
        { type: 'Green', count: 30, spacing: 0.5, isCamo: true },
        { type: 'Yellow', count: 20, spacing: 0.6, isCamo: true }
      ]
    },
    {
      bloons: [
        { type: 'Pink', count: 25, spacing: 0.4, isRegrow: true },
        { type: 'Black', count: 10, spacing: 0.8, isRegrow: true }
      ]
    },
    {
      bloons: [
        { type: 'Rainbow', count: 15, spacing: 1, isRegrow: true },
        { type: 'Ceramic', count: 5, spacing: 1.5, isCamo: true }
      ]
    },
    {
      bloons: [
        { type: 'Rainbow', count: 20, spacing: 0.8 },
        { type: 'Ceramic', count: 6, spacing: 1.5 },
        { type: 'MOAB', count: 1, spacing: 0 }
      ]
    },
    {
      bloons: [
        { type: 'MOAB', count: 2, spacing: 3 }
      ]
    },
    {
      bloons: [
        { type: 'Ceramic', count: 15, spacing: 1, isCamo: true, isRegrow: true },
        { type: 'MOAB', count: 3, spacing: 2.5 }
      ]
    },
    {
      bloons: [
        { type: 'Rainbow', count: 30, spacing: 0.6, isRegrow: true },
        { type: 'MOAB', count: 4, spacing: 2 }
      ]
    },
    {
      bloons: [
        { type: 'Ceramic', count: 20, spacing: 0.8, isCamo: true },
        { type: 'MOAB', count: 2, spacing: 3 },
        { type: 'BFB', count: 1, spacing: 0 }
      ]
    },
    {
      bloons: [
        { type: 'MOAB', count: 4, spacing: 2 },
        { type: 'BFB', count: 2, spacing: 4 }
      ]
    }
  ]
};

export const ENEMY_PROPERTIES = {
  red: {
    health: 1,
    speed: 1.0,
    cashPrize: 1
  },
  blue: {
    health: 1,
    speed: 1.2,
    cashPrize: 2
  },
  green: {
    health: 1,
    speed: 1.5,
    cashPrize: 3
  },
  yellow: {
    health: 1,
    speed: 2.0,
    cashPrize: 4
  }
}; 