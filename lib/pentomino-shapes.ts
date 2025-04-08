// Define all 12 pentomino shapes
export function createPentominoShapes() {
  // Each pentomino is defined by a set of coordinates relative to a center point
  const shapes = {
    // F pentomino
    F: [
      [0, 0],
      [0, -1],
      [1, -1],
      [-1, 0],
      [0, 1],
    ],
    // I pentomino (5 blocks in a line)
    I: [
      [0, 0],
      [-2, 0],
      [-1, 0],
      [1, 0],
      [2, 0],
    ],
    // L pentomino
    L: [
      [0, 0],
      [-2, 0],
      [-1, 0],
      [1, 0],
      [-2, 1],
    ],
    // N pentomino
    N: [
      [0, 0],
      [-1, 0],
      [1, 0],
      [1, -1],
      [2, -1],
    ],
    // P pentomino
    P: [
      [0, 0],
      [0, -1],
      [1, -1],
      [0, 1],
      [1, 0],
    ],
    // T pentomino
    T: [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, 1],
      [0, 2],
    ],
    // U pentomino
    U: [
      [0, 0],
      [-1, 0],
      [1, 0],
      [-1, 1],
      [1, 1],
    ],
    // V pentomino
    V: [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 2],
      [2, 2],
    ],
    // W pentomino
    W: [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2],
      [2, 2],
    ],
    // X pentomino
    X: [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ],
    // Y pentomino
    Y: [
      [0, 0],
      [-1, 0],
      [1, 0],
      [2, 0],
      [0, 1],
    ],
    // Z pentomino
    Z: [
      [0, 0],
      [-1, 0],
      [0, 1],
      [0, 2],
      [1, 2],
    ],
  }

  // Function to get the index of a pentomino type (1-based)
  const getTypeIndex = (type: string) => {
    const types = Object.keys(shapes)
    return types.indexOf(type) + 1
  }

  return {
    shapes,
    getTypeIndex,
  }
}
