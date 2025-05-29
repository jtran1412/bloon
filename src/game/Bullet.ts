// src/game/Bullet.ts
import { Bullet, Point } from './Types'

export class BulletClass implements Bullet {
  id: number
  position: Point
  targetEnemyId: number
  speed: number
  damage: number
  isActive: boolean

  constructor(id: number, startPos: Point, targetEnemyId: number, damage: number) {
    this.id = id
    this.position = startPos
    this.targetEnemyId = targetEnemyId
    this.speed = 5
    this.damage = damage
    this.isActive = true
  }

  update(enemies: Map<number, any>) {
    // Move bullet toward target enemy
    const enemy = enemies.get(this.targetEnemyId)
    if (!enemy || !enemy.isAlive) {
      this.isActive = false
      return
    }

    const dx = enemy.position.x - this.position.x
    const dy = enemy.position.y - this.position.y
    const dist = Math.sqrt(dx*dx + dy*dy)

    if (dist < this.speed) {
      enemy.takeDamage(this.damage)
      this.isActive = false
    } else {
      this.position.x += (dx / dist) * this.speed
      this.position.y += (dy / dist) * this.speed
    }
  }
}
