// Define types for the game

// Represents a single cell position [x, y]
export type CellPosition = [number, number]

// Piece types
export type PieceType = "tromino" | "tetromino" | "pentomino"

// Represents a game piece
export interface GamePiece {
  shape: CellPosition[]
  x: number
  y: number
  type: string
  pieceType: PieceType
  color: string
}

// Represents the game board - a 2D array of numbers
// 0 = empty, other values = color index
export type GameBoard = number[][]

// Represents the shapes collection
export interface ShapesCollection {
  shapes: Record<string, CellPosition[]>
  getTypeIndex: (type: string) => number
}

// Game statistics
export interface GameStats {
  score: number
  level: number
  lines: number
}

// Log entry for a single game event
export interface LogEntry {
  timestamp: string
  eventType: string
  data: any
  stats: GameStats
  currentPiece?: GamePiece
  boardState?: string
}

// Complete game log
export interface GameLog {
  sessionId: string
  startTime: string
  endTime: string
  entries: LogEntry[]
  finalStats: GameStats
}

// Represents the pentomino shapes collection
export interface PentominoShapes {
  shapes: Record<string, CellPosition[]>
  getTypeIndex: (type: string) => number
}
