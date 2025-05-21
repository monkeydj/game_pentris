// Define tromino shapes (3 blocks)
import type { CellPosition, ShapesCollection } from "./types"

export function createTrominoShapes(): ShapesCollection {
  // Each tromino is defined by a set of coordinates relative to a center point
  const shapes: Record<string, CellPosition[]> = {
    // I tromino (3 blocks in a line)
    I: [
      [0, 0],
      [-1, 0],
      [1, 0],
    ],
    // V tromino
    V: [
      [0, 0],
      [0, 1],
      [1, 0],
    ],
    // L tromino
    L: [
      [0, 0],
      [0, 1],
      [0, 2],
    ],
  }

  // Function to get the index of a tromino type (1-based)
  const getTypeIndex = (type: string): number => {
    const types = Object.keys(shapes)
    return types.indexOf(type) + 1
  }

  return {
    shapes,
    getTypeIndex,
  }
}
