// src/game/Grid.ts

export interface GridCell {
  x: number
  y: number
  walkable: boolean
  occupied: boolean
}

export class Grid {
  width: number
  height: number
  cells: GridCell[][]

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.cells = []

    for (let y = 0; y < height; y++) {
      const row: GridCell[] = []
      for (let x = 0; x < width; x++) {
        row.push({
          x,
          y,
          walkable: true,
          occupied: false,
        })
      }
      this.cells.push(row)
    }
  }

  isWalkable(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return false
    return this.cells[y][x].walkable && !this.cells[y][x].occupied
  }

  setOccupied(x: number, y: number, occupied: boolean) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return
    this.cells[y][x].occupied = occupied
  }

  setWalkable(x: number, y: number, walkable: boolean) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return
    this.cells[y][x].walkable = walkable
  }

  getNeighbors(x: number, y: number): GridCell[] {
    const neighbors: GridCell[] = []
    const dirs = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ]

    for (const [dx, dy] of dirs) {
      const nx = x + dx
      const ny = y + dy
      if (this.isWalkable(nx, ny)) {
        neighbors.push(this.cells[ny][nx])
      }
    }
    return neighbors
  }
}
