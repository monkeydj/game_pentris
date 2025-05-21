// Board dimensions
export const BOARD_WIDTH = 15
export const BOARD_HEIGHT = 25
export const CELL_SIZE = 24

// Colors for different pieces
export const COLORS = {
  // Tromino colors
  tromino: [
    "#FF5252", // Light Red
    "#4FC3F7", // Light Blue
    "#FFC107", // Amber
  ],
  // Tetromino colors
  tetromino: [
    "#F44336", // Red
    "#2196F3", // Blue
    "#FFEB3B", // Yellow
    "#4CAF50", // Green
    "#9C27B0", // Purple
    "#FF9800", // Orange
    "#03A9F4", // Light Blue
  ],
  // Pentomino colors
  pentomino: [
    "#FF0000", // F - Red
    "#00FF00", // I - Green
    "#0000FF", // L - Blue
    "#FFFF00", // N - Yellow
    "#FF00FF", // P - Magenta
    "#00FFFF", // T - Cyan
    "#FFA500", // U - Orange
    "#800080", // V - Purple
    "#008000", // W - Dark Green
    "#FFC0CB", // X - Pink
    "#A52A2A", // Y - Brown
    "#808080", // Z - Gray
  ],
}

// Game settings
export const LOCK_DELAY = 1500 // 1.5 seconds in milliseconds
export const BASE_DROP_INTERVAL = 1000 // 1 second in milliseconds
export const LEVEL_SPEED_FACTOR = 50 // ms faster per level

// Piece type weights for probability distribution of next piece
export const PIECE_TYPE_WEIGHTS = {
  tromino: 80,
  tetromino: 130,
  pentomino: 210,
}

// Scoring system
export const SCORING = {
  softDrop: 1, // Points per cell when soft dropping
  hardDrop: 2, // Points per cell when hard dropping
  linesClear: {
    1: 100,
    2: 300,
    3: 500,
    4: 800,
    5: 1200,
  },
}
