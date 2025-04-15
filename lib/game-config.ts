export const GAME_CONFIG = {
  BOARD: {
    WIDTH: 10,
    HEIGHT: 20,
    CELL_SIZE: 30,
  },
  TIMING: {
    LOCK_DELAY: 1500,
    BASE_DROP_INTERVAL: 1000,
    LEVEL_SPEED_INCREASE: 50,
    MIN_DROP_INTERVAL: 100,
  },
  SCORING: {
    POINTS: {
      SINGLE: 100,
      DOUBLE: 300,
      TRIPLE: 500,
      TETRIS: 800,
      PENTRIS: 1000,
    },
    LINES_PER_LEVEL: 10,
  },
  COLORS: [
    "#FF0000", // Red
    "#00FF00", // Green
    "#0000FF", // Blue
    "#FFFF00", // Yellow
    "#FF00FF", // Magenta
    "#00FFFF", // Cyan
    "#FFA500", // Orange
    "#800080", // Purple
    "#008000", // Dark Green
    "#FF69B4", // Pink
    "#4B0082", // Indigo
    "#8B4513", // Brown
  ] as const,
  DEBUG: {
    ENABLED: process.env.NODE_ENV === 'development',
    SHOW_GHOST_PIECE: true,
    SHOW_GRID: true,
  }
} as const;