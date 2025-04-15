// Define types for the game

// Represents a single cell position [x, y]
export type CellPosition = [number, number]

// Represents a pentomino piece
export interface PentominoPiece {
  shape: CellPosition[]
  x: number
  y: number
  type: string
}

// Represents the game board - a 2D array of numbers
// 0 = empty, 1-12 = pentomino type index
export type GameBoard = number[][]

// Represents the pentomino shapes collection
export interface PentominoShapes {
  shapes: Record<string, CellPosition[]>
  getTypeIndex: (type: string) => number
}
