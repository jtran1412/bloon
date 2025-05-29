// src/game/Tower.ts
import { Tower, Point, TowerType, Enemy } from './Types'

export class TowerClass implements Tower {
  id: number
  type: TowerType
  position: Point
  range: number
  damage: number
  fireRate: number
  lastShotTime: number

  constructor(id: number, type: TowerType, position: Point) {
    this.id = id
    this.type = type
    this.position = position
    this.range = 100
    this.damage = 10
    this.fireRate = 1 // one shot per second
    this.lastShotTime = 0
  }

  canShoot(currentTime: number): boolean {
    return currentTime - this.lastShotTime >= 1000 / this.fireRate
  }

  isInRange(enemy: Enemy): boolean {
    const dx = enemy.position.x - this.position.x
    const dy = enemy.position.y - this.position.y
    return Math.sqrt(dx*dx + dy*dy) <= this.range
  }

  shoot(enemy: Enemy, currentTime: number) {
    this.lastShotTime = currentTime
    enemy.takeDamage(this.damage)
    // Ideally create a bullet and add to bullets array (to be done in GameManager)
  }
}
