// src/game/Enemy.ts
import { Enemy, Point, EnemyType } from './Types'

export class EnemyClass implements Enemy {
  id: number
  type: EnemyType
  position: Point
  health: number
  speed: number
  pathIndex: number
  isAlive: boolean

  constructor(id: number, type: EnemyType, startPos: Point) {
    this.id = id
    this.type = type
    this.position = startPos
    this.health = 100 // default, can vary by type
    this.speed = 1    // default speed, vary by type
    this.pathIndex = 0
    this.isAlive = true
  }

  move(path: Point[]) {
    // Move enemy toward next path point
    if (!this.isAlive) return

    const target = path[this.pathIndex]
    if (!target) return

    // Simple linear movement logic
    const dx = target.x - this.position.x
    const dy = target.y - this.position.y
    const dist = Math.sqrt(dx*dx + dy*dy)
    if (dist < this.speed) {
      this.position = target
      this.pathIndex += 1
    } else {
      this.position.x += (dx / dist) * this.speed
      this.position.y += (dy / dist) * this.speed
    }
  }

  takeDamage(amount: number) {
    this.health -= amount
    if (this.health <= 0) {
      this.isAlive = false
    }
  }
}
