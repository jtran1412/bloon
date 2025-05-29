// src/game/GameManager.ts
import { EnemyClass } from './Enemy'
import { TowerClass } from './Tower'
import { BulletClass } from './Bullet'
import { Point } from './Types'

export class GameManager {
  enemies: Map<number, EnemyClass> = new Map()
  towers: Map<number, TowerClass> = new Map()
  bullets: Map<number, BulletClass> = new Map()
  path: Point[] = [] // Path points enemies follow

  enemyIdCounter = 0
  towerIdCounter = 0
  bulletIdCounter = 0

  constructor(path: Point[]) {
    this.path = path
  }

  spawnEnemy(type: number) {
    const enemy = new EnemyClass(this.enemyIdCounter++, type, this.path[0])
    this.enemies.set(enemy.id, enemy)
  }

  placeTower(type: number, position: Point) {
    const tower = new TowerClass(this.towerIdCounter++, type, position)
    this.towers.set(tower.id, tower)
  }

  update(currentTime: number) {
    // Update enemies
    this.enemies.forEach(enemy => {
      if (enemy.isAlive) enemy.move(this.path)
      else this.enemies.delete(enemy.id)
    })

    // Update towers shooting
    this.towers.forEach(tower => {
      if (tower.canShoot(currentTime)) {
        // Find first enemy in range
        for (const enemy of this.enemies.values()) {
          if (enemy.isAlive && tower.isInRange(enemy)) {
            tower.shoot(enemy, currentTime)
            // Create bullet if you want, omitted here for brevity
            break
          }
        }
      }
    })

    // Update bullets
    this.bullets.forEach(bullet => {
      bullet.update(this.enemies)
      if (!bullet.isActive) this.bullets.delete(bullet.id)
    })
  }
}
