// src/game/Types.ts

export interface Point {
  x: number
  y: number
}

export enum EnemyType {
  Basic,
  Fast,
  Tank,
}

export interface Enemy {
  id: number
  type: EnemyType
  position: Point
  health: number
  speed: number
  pathIndex: number // which path node enemy is moving toward
  isAlive: boolean
}

export enum TowerType {
  Basic,
  Sniper,
  Cannon,
}

export interface Tower {
  id: number
  type: TowerType
  position: Point
  range: number
  damage: number
  fireRate: number // shots per second
  lastShotTime: number
}

export interface Bullet {
  id: number
  position: Point
  targetEnemyId: number
  speed: number
  damage: number
  isActive: boolean
}

export interface GridCell {
  x: number
  y: number
  walkable: boolean
  hasTower: boolean
}
