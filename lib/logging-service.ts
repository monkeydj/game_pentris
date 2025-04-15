// Logging service for game state tracking

import type { GamePiece, GameBoard, GameStats, LogEntry, GameLog } from "./types"

class LoggingService {
  private logs: GameLog = {
    sessionId: "",
    startTime: "",
    endTime: "",
    entries: [],
    finalStats: {
      score: 0,
      level: 1,
      lines: 0,
    },
  }

  constructor() {
    this.initSession()
  }

  // Initialize a new session
  public initSession(): void {
    const sessionId = `pentris-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    this.logs = {
      sessionId,
      startTime: new Date().toISOString(),
      endTime: "",
      entries: [],
      finalStats: {
        score: 0,
        level: 1,
        lines: 0,
      },
    }

    console.log(`Logging session started: ${sessionId}`)
  }

  // Log a game event
  public logEvent(
    eventType: string,
    data: any,
    stats: GameStats,
    currentPiece?: GamePiece | null,
    board?: GameBoard,
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      eventType,
      data,
      stats: { ...stats },
    }

    // Optionally include current piece and board state
    if (currentPiece) {
      entry.currentPiece = { ...currentPiece }
    }

    // Only include board state for specific events to avoid excessive data
    if (board && ["pieceLockedDown", "linesCleared", "gameOver"].includes(eventType)) {
      // Create a simplified representation of the board (run-length encoding)
      entry.boardState = this.compressBoardState(board)
    }

    this.logs.entries.push(entry)
  }

  // Compress board state to reduce log size
  private compressBoardState(board: GameBoard): string {
    // Simple run-length encoding
    let compressed = ""
    let lastValue = -1
    let count = 0

    for (const row of board) {
      for (const cell of row) {
        if (cell === lastValue) {
          count++
        } else {
          if (count > 0) {
            compressed += `${count}x${lastValue},`
          }
          lastValue = cell
          count = 1
        }
      }
    }

    if (count > 0) {
      compressed += `${count}x${lastValue}`
    }

    return compressed
  }

  // End the session and set final stats
  public endSession(finalStats: GameStats): void {
    this.logs.endTime = new Date().toISOString()
    this.logs.finalStats = { ...finalStats }

    console.log(`Logging session ended: ${this.logs.sessionId}`)
    console.log(`Final score: ${finalStats.score}, Level: ${finalStats.level}, Lines: ${finalStats.lines}`)
  }

  // Get the current logs
  public getLogs(): GameLog {
    return { ...this.logs }
  }

  // Generate a downloadable JSON file
  public generateDownloadableJSON(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  // Clear logs
  public clearLogs(): void {
    this.initSession()
  }
}

// Export a singleton instance
export const loggingService = new LoggingService()
