// Define tetromino shapes (4 blocks)
import type { CellPosition, ShapesCollection } from "./types"

export function createTetrominoShapes(): ShapesCollection {
  // Each tetromino is defined by a set of coordinates relative to a center point
  const shapes: Record<string, CellPosition[]> = {
    // I tetromino (4 blocks in a line)
    I: [
      [0, 0],
      [-1, 0],
      [1, 0],
      [2, 0],
    ],
    // O tetromino (square)
    O: [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
    // T tetromino
    T: [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, 1],
    ],
    // L tetromino
    L: [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 2],
    ],
    // J tetromino
    J: [
      [0, 0],
      [0, 1],
      [0, 2],
      [-1, 2],
    ],
    // S tetromino
    S: [
      [0, 0],
      [1, 0],
      [0, 1],
      [-1, 1],
    ],
    // Z tetromino
    Z: [
      [0, 0],
      [-1, 0],
      [0, 1],
      [1, 1],
    ],
  }

  // Function to get the index of a tetromino type (1-based)
  const getTypeIndex = (type: string): number => {
    const types = Object.keys(shapes)
    return types.indexOf(type) + 1
  }

  return {
    shapes,
    getTypeIndex,
  }
}
