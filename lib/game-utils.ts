// Create an empty game board
export function createEmptyBoard(width: number, height: number): number[][] {
  return Array(height)
    .fill(0)
    .map(() => Array(width).fill(0))
}

// Check if a piece collides with the board or goes out of bounds
export function checkCollision(board: number[][], piece: number[][], position: { x: number; y: number }): boolean {
  for (let y = 0; y < piece.length; y++) {
    for (let x = 0; x < piece[y].length; x++) {
      // Skip empty cells in the piece
      if (!piece[y][x]) continue

      const boardX = x + position.x
      const boardY = y + position.y

      // Check if out of bounds
      if (boardX < 0 || boardX >= board[0].length || boardY < 0 || boardY >= board.length) {
        return true
      }

      // Check if collides with a non-empty cell on the board
      if (board[boardY][boardX]) {
        return true
      }
    }
  }

  return false
}

// Add a piece to the board (permanently or temporarily for display)
export function addPieceToBoard(
  board: number[][],
  piece: number[][],
  position: { x: number; y: number },
  isGhost = false,
): number[][] {
  // Create a copy of the board
  const newBoard = board.map((row) => [...row])

  for (let y = 0; y < piece.length; y++) {
    for (let x = 0; x < piece[y].length; x++) {
      // Skip empty cells in the piece
      if (!piece[y][x]) continue

      const boardX = x + position.x
      const boardY = y + position.y

      // Skip if out of bounds
      if (boardX < 0 || boardX >= newBoard[0].length || boardY < 0 || boardY >= newBoard.length) {
        continue
      }

      // Add the piece to the board
      newBoard[boardY][boardX] = isGhost ? -1 : piece[y][x]
    }
  }

  return newBoard
}

// Clear full rows and return the new board and number of rows cleared
export function clearFullRows(board: number[][]): { clearedBoard: number[][]; rowsCleared: number } {
  let rowsCleared = 0
  const clearedBoard = []

  // Check each row
  for (let y = 0; y < board.length; y++) {
    // If the row is not full, keep it
    if (board[y].some((cell) => cell === 0)) {
      clearedBoard.push([...board[y]])
    } else {
      // If the row is full, increment the counter
      rowsCleared++
    }
  }

  // Add empty rows at the top
  const emptyRows = Array(rowsCleared)
    .fill(0)
    .map(() => Array(board[0].length).fill(0))

  return {
    clearedBoard: [...emptyRows, ...clearedBoard],
    rowsCleared,
  }
}

// Rotate a matrix 90 degrees clockwise
export function rotateMatrix(matrix: number[][]): number[][] {
  const n = matrix.length
  const rotated = Array(n)
    .fill(0)
    .map(() => Array(n).fill(0))

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      rotated[x][n - 1 - y] = matrix[y][x]
    }
  }

  return rotated
}

// Define all possible pieces (tetrominoes and pentominoes)
const PIECES = {
  // Tetrominoes (4 blocks)
  I: {
    matrix: [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ],
    color: 1,
  },
  J: {
    matrix: [
      [0, 0, 0, 0, 0],
      [0, 2, 0, 0, 0],
      [0, 2, 2, 2, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ],
    color: 2,
  },
  L: {
    matrix: [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 3, 0],
      [0, 3, 3, 3, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ],
    color: 3,
  },
  O: {
    matrix: [
      [0, 0, 0, 0, 0],
      [0, 4, 4, 0, 0],
      [0, 4, 4, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ],
    color: 4,
  },
  S: {
    matrix: [
      [0, 0, 0, 0, 0],
      [0, 0, 5, 5, 0],
      [0, 5, 5, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ],
    color: 5,
  },
  T: {
    matrix: [
      [0, 0, 0, 0, 0],
      [0, 0, 6, 0, 0],
      [0, 6, 6, 6, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ],
    color: 6,
  },
  Z: {
    matrix: [
      [0, 0, 0, 0, 0],
      [0, 7, 7, 0, 0],
      [0, 0, 7, 7, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ],
    color: 7,
  },
  // Pentominoes (5 blocks)
  P: {
    matrix: [
      [0, 0, 0, 0, 0],
      [0, 8, 8, 0, 0],
      [0, 8, 8, 8, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ],
    color: 8,
  },
  F: {
    matrix: [
      [0, 0, 0, 0, 0],
      [0, 0, 9, 9, 0],
      [0, 9, 9, 0, 0],
      [0, 0, 9, 0, 0],
      [0, 0, 0, 0, 0],
    ],
    color: 9,
  },
  X: {
    matrix: [
      [0, 0, 0, 0, 0],
      [0, 0, 10, 0, 0],
      [0, 10, 10, 10, 0],
      [0, 0, 10, 0, 0],
      [0, 0, 0, 0, 0],
    ],
    color: 10,
  },
  W: {
    matrix: [
      [0, 0, 0, 0, 0],
      [0, 11, 0, 0, 0],
      [0, 11, 11, 0, 0],
      [0, 0, 11, 11, 0],
      [0, 0, 0, 0, 0],
    ],
    color: 11,
  },
  Y: {
    matrix: [
      [0, 0, 0, 0, 0],
      [0, 0, 12, 0, 0],
      [0, 12, 12, 12, 12],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ],
    color: 12,
  },
}

// Create a random piece
export function createRandomPiece(): number[][] {
  const pieceTypes = Object.keys(PIECES)
  const randomType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)]
  return PIECES[randomType as keyof typeof PIECES].matrix
}
