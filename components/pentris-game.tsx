"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  CELL_SIZE,
  COLORS,
  LOCK_DELAY,
  BASE_DROP_INTERVAL,
  LEVEL_SPEED_FACTOR,
  PIECE_TYPE_WEIGHTS,
  PIECE_TYPE_SPEED_FACTORS,
  SCORING,
} from "@/lib/constants"
import { createPentominoShapes } from "@/lib/pentomino-shapes"
import { createTetrominoShapes } from "@/lib/tetromino-shapes"
import { createTrominoShapes } from "@/lib/tromino-shapes"
import { useGameControls } from "@/hooks/use-game-controls"
import MobileControls from "./mobile-controls"
import LogDownloader from "./log-downloader"
import { loggingService } from "@/lib/logging-service"
import type { CellPosition, GameBoard, GamePiece, GameStats, PieceType } from "@/lib/types"

export default function PentrisGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    level: 1,
    lines: 0,
  })
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [paused, setPaused] = useState<boolean>(false)
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  const [isLocking, setIsLocking] = useState<boolean>(false)
  const lockTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lockTimeRef = useRef<number>(0)
  const currentPieceRef = useRef<GamePiece | null>(null)
  const boardRef = useRef<GameBoard>([])
  const autoDropTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastMoveScoreRef = useRef<number>(0)

  // Game state
  const [board, setBoard] = useState<GameBoard>(() => {
    const initialBoard: GameBoard = Array(BOARD_HEIGHT)
      .fill(0)
      .map(() => Array(BOARD_WIDTH).fill(0))
    boardRef.current = initialBoard
    return initialBoard
  })
  const [currentPiece, setCurrentPiece] = useState<GamePiece | null>(null)
  const [nextPiece, setNextPiece] = useState<GamePiece | null>(null)

  // Shape collections
  const pentominoShapes = createPentominoShapes()
  const tetrominoShapes = createTetrominoShapes()
  const trominoShapes = createTrominoShapes()

  // Game loop reference
  const gameLoopRef = useRef<number | null>(null)

  // Update currentPieceRef when currentPiece changes
  useEffect(() => {
    currentPieceRef.current = currentPiece
  }, [currentPiece])

  // Update boardRef when board changes
  useEffect(() => {
    boardRef.current = board
  }, [board])

  // Initialize game
  const initGame = (): void => {
    const initialBoard: GameBoard = Array(BOARD_HEIGHT)
      .fill(0)
      .map(() => Array(BOARD_WIDTH).fill(0))

    setBoard(initialBoard)
    boardRef.current = initialBoard

    const initialStats = {
      score: 0,
      level: 1,
      lines: 0,
    }

    setStats(initialStats)
    setGameOver(false)
    setPaused(false)
    setGameStarted(true)
    setIsLocking(false)
    lastMoveScoreRef.current = 0

    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current)
      lockTimerRef.current = null
    }

    if (autoDropTimerRef.current) {
      clearTimeout(autoDropTimerRef.current)
      autoDropTimerRef.current = null
    }

    // Initialize logging service
    loggingService.initSession()
    loggingService.logEvent("gameStart", { boardWidth: BOARD_WIDTH, boardHeight: BOARD_HEIGHT }, initialStats)

    // Generate first pieces
    const firstPiece = generateRandomPiece()
    const secondPiece = generateRandomPiece()
    setCurrentPiece(firstPiece)
    currentPieceRef.current = firstPiece
    setNextPiece(secondPiece)

    // Log initial pieces
    loggingService.logEvent("pieceGenerated", { piece: firstPiece, isFirstPiece: true }, initialStats, firstPiece)
    loggingService.logEvent("nextPieceGenerated", { piece: secondPiece }, initialStats)

    // Start game loop
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    gameLoop()

    // Start auto drop timer
    startAutoDropTimer()
  }

  // Start auto drop timer
  const startAutoDropTimer = (): void => {
    if (autoDropTimerRef.current) {
      clearTimeout(autoDropTimerRef.current)
    }

    // Calculate drop interval based on level and piece type
    const baseInterval = Math.max(100, BASE_DROP_INTERVAL - (stats.level - 1) * LEVEL_SPEED_FACTOR)
    const pieceType = currentPieceRef.current?.pieceType || "tetromino"
    const speedFactor = PIECE_TYPE_SPEED_FACTORS[pieceType]
    const dropInterval = Math.floor(baseInterval * speedFactor)

    autoDropTimerRef.current = setTimeout(() => {
      if (!paused && !gameOver && currentPieceRef.current) {
        // Only continue auto dropping if the move was successful
        const moveSuccessful = moveDown(true)
        if (moveSuccessful) {
          startAutoDropTimer()
        }
      } else if (!paused && !gameOver) {
        // If piece is locked, wait for next piece before starting timer
        startAutoDropTimer()
      }
    }, dropInterval)
  }

  // Generate a random piece type based on weights
  const getRandomPieceType = (): PieceType => {
    const weights = PIECE_TYPE_WEIGHTS
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
    let random = Math.random() * totalWeight

    for (const [type, weight] of Object.entries(weights)) {
      if (random < weight) {
        return type as PieceType
      }
      random -= weight
    }

    return "pentomino" // Default fallback
  }

  // Get shapes collection based on piece type
  const getShapesForType = (pieceType: PieceType) => {
    switch (pieceType) {
      case "tromino":
        return trominoShapes
      case "tetromino":
        return tetrominoShapes
      case "pentomino":
      default:
        return pentominoShapes
    }
  }

  // Generate a random piece
  const generateRandomPiece = (): GamePiece => {
    // Randomly select piece type
    const pieceType = getRandomPieceType()
    const shapes = getShapesForType(pieceType)

    // Get only the shape keys
    const shapeKeys = Object.keys(shapes.shapes)
    const randomKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)]
    const shape = shapes.shapes[randomKey]

    // Find the width of the shape
    let maxX = 0
    for (const [x] of shape) {
      maxX = Math.max(maxX, x)
    }

    // Select a random color for this piece type
    const colorArray = COLORS[pieceType]
    const colorIndex = Math.floor(Math.random() * colorArray.length)
    const color = colorArray[colorIndex]

    return {
      shape: shape,
      x: Math.floor(BOARD_WIDTH / 2) - Math.ceil(maxX / 2),
      y: 0,
      type: randomKey,
      pieceType: pieceType,
      color: color,
    }
  }

  // Check if the current position is valid
  const isValidPosition = (piece: GamePiece, boardToCheck: GameBoard = boardRef.current): boolean => {
    for (const [x, y] of piece.shape) {
      const newX = piece.x + x
      const newY = piece.y + y

      // Check if out of bounds
      if (newX < 0 || newX >= BOARD_WIDTH || newY < 0 || newY >= BOARD_HEIGHT) {
        return false
      }

      // Check if overlapping with existing pieces
      if (newY >= 0 && boardToCheck[newY][newX] !== 0) {
        return false
      }
    }

    return true
  }

  // Check if the piece can move down
  const canMoveDown = (piece: GamePiece): boolean => {
    const testPiece: GamePiece = {
      ...piece,
      y: piece.y + 1,
    }
    return isValidPosition(testPiece)
  }

  // Start the lock timer
  const startLockTimer = (): void => {
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current)
    }

    setIsLocking(true)
    lockTimeRef.current = Date.now() + LOCK_DELAY

    // Log lock timer start
    loggingService.logEvent(
      "lockTimerStarted",
      {
        delay: LOCK_DELAY,
        piecePosition: currentPieceRef.current ? { x: currentPieceRef.current.x, y: currentPieceRef.current.y } : null,
      },
      stats,
      currentPieceRef.current,
    )

    lockTimerRef.current = setTimeout(() => {
      // Make sure we're still in a valid game state
      if (!gameOver && !paused) {
        finalizeLock()
      }
    }, LOCK_DELAY)
  }

  // Reset the lock timer
  const resetLockTimer = (): void => {
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current)
      lockTimerRef.current = null
    }

    // Only reset if the piece can still move down
    if (currentPieceRef.current && canMoveDown(currentPieceRef.current)) {
      setIsLocking(false)
      return
    }

    // If piece can't move down, restart the lock timer
    setIsLocking(true)
    lockTimeRef.current = Date.now() + LOCK_DELAY

    // Log lock timer reset
    loggingService.logEvent(
      "lockTimerReset",
      {
        delay: LOCK_DELAY,
        piecePosition: currentPieceRef.current
          ? { x: currentPieceRef.current.x, y: currentPieceRef.current.y }
          : null,
      },
      stats,
      currentPieceRef.current,
    )

    lockTimerRef.current = setTimeout(() => {
      // Make sure we're still in a valid game state
      if (!gameOver && !paused) {
        finalizeLock()
      }
    }, LOCK_DELAY)
  }

  // Finalize the locking process
  const finalizeLock = (): void => {
    // Clear the timer reference
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current)
      lockTimerRef.current = null
    }

    // Use the current piece from the ref to ensure we have the latest state
    const pieceToLock = currentPieceRef.current

    if (pieceToLock) {
      // Lock the current piece
      lockPieceAtPosition(pieceToLock)
    }

    // Reset locking state
    setIsLocking(false)
  }

  // Move piece left
  const moveLeft = (): void => {
    if (paused || gameOver || !currentPiece) return

    const newPiece: GamePiece = {
      ...currentPiece,
      x: currentPiece.x - 1,
    }

    if (isValidPosition(newPiece)) {
      setCurrentPiece(newPiece)
      currentPieceRef.current = newPiece

      // Log move
      loggingService.logEvent(
        "pieceMove",
        { direction: "left", newPosition: { x: newPiece.x, y: newPiece.y } },
        stats,
        newPiece,
      )

      // Check if piece can still move down after moving left
      if (isLocking && canMoveDown(newPiece)) {
        resetLockTimer()
      } else if (!isLocking && !canMoveDown(newPiece)) {
        startLockTimer()
      }
    }
  }

  // Move piece right
  const moveRight = (): void => {
    if (paused || gameOver || !currentPiece) return

    const newPiece: GamePiece = {
      ...currentPiece,
      x: currentPiece.x + 1,
    }

    if (isValidPosition(newPiece)) {
      setCurrentPiece(newPiece)
      currentPieceRef.current = newPiece

      // Log move
      loggingService.logEvent(
        "pieceMove",
        { direction: "right", newPosition: { x: newPiece.x, y: newPiece.y } },
        stats,
        newPiece,
      )

      // Check if piece can still move down after moving right
      if (isLocking && canMoveDown(newPiece)) {
        resetLockTimer()
      } else if (!isLocking && !canMoveDown(newPiece)) {
        startLockTimer()
      }
    }
  }

  // Move piece down (can be triggered manually or automatically)
  const moveDown = (isAutomatic = false): boolean => {
    if (paused || gameOver || !currentPiece) return false

    const newPiece: GamePiece = {
      ...currentPiece,
      y: currentPiece.y + 1,
    }

    if (isValidPosition(newPiece)) {
      // Update both state and ref in one go to prevent state conflicts
      currentPieceRef.current = newPiece
      setCurrentPiece(newPiece)

      // Log move
      loggingService.logEvent(
        "pieceMove",
        {
          direction: "down",
          isAutomatic,
          newPosition: { x: newPiece.x, y: newPiece.y },
        },
        stats,
        newPiece,
      )

      // Add points for soft drop (manual move down)
      if (!isAutomatic) {
        addToScore(SCORING.softDrop)
      }

      return true
    } else {
      // Piece can't move down further, start lock delay
      if (!isLocking) {
        startLockTimer()
      }
      return false
    }
  }

  // Hard drop piece
  const hardDrop = (): void => {
    if (paused || gameOver || !currentPiece) return

    // Calculate drop distance without moving the piece
    let dropDistance = 0
    let testY = currentPiece.y

    // Use a more efficient way to find the lowest position
    while (isValidPosition({ ...currentPiece, y: testY + 1 })) {
      testY++
      dropDistance++
    }

    // Only update state once with the final position
    const droppedPiece: GamePiece = {
      ...currentPiece,
      y: testY,
    }

    // Update both state and ref in one go
    currentPieceRef.current = droppedPiece
    setCurrentPiece(droppedPiece)

    // Log hard drop
    loggingService.logEvent(
      "hardDrop",
      {
        fromPosition: { x: currentPiece.x, y: currentPiece.y },
        toPosition: { x: droppedPiece.x, y: droppedPiece.y },
        dropDistance,
      },
      stats,
      droppedPiece,
    )

    // Add points for hard drop
    addToScore(dropDistance * SCORING.hardDrop)

    // Start the lock timer
    startLockTimer()
  }

  // Add to the score
  const addToScore = (points: number): void => {
    lastMoveScoreRef.current = points

    const newStats = {
      ...stats,
      score: stats.score + points,
    }

    setStats(newStats)

    // Log score change
    loggingService.logEvent("scoreChange", { points, newScore: newStats.score }, newStats)
  }

  // Lock a piece at a specific position
  const lockPieceAtPosition = (piece: GamePiece): void => {
    if (!piece) return

    try {
      // Create a new board with the locked piece
      const currentBoard: GameBoard = [...boardRef.current.map((row) => [...row])]

      // Get color index for this piece
      const colorIndex = COLORS[piece.pieceType].indexOf(piece.color) + 1
      // Offset by piece type to ensure unique color indices
      const colorValue = colorIndex + (piece.pieceType === "tetromino" ? 10 : piece.pieceType === "pentomino" ? 20 : 0)

      // Add the piece to the board
      for (const [x, y] of piece.shape) {
        const boardX = piece.x + x
        const boardY = piece.y + y

        if (boardY < 0) {
          // Game over if piece is locked above the board
          setGameOver(true)

          // Log game over
          loggingService.logEvent(
            "gameOver",
            { reason: "pieceLockedAboveBoard", finalScore: stats.score },
            stats,
            piece,
            currentBoard,
          )

          // End logging session
          loggingService.endSession(stats)

          return
        }

        currentBoard[boardY][boardX] = colorValue
      }

      // Update the board with the locked piece
      setBoard(currentBoard)
      boardRef.current = currentBoard

      // Log piece locked
      loggingService.logEvent(
        "pieceLockedDown",
        {
          pieceType: piece.pieceType,
          pieceShape: piece.type,
          position: { x: piece.x, y: piece.y },
        },
        stats,
        piece,
        currentBoard,
      )

      // Check for completed lines
      const completedLines = checkCompletedLines(currentBoard)
      if (completedLines.length > 0) {
        const updatedBoard = removeCompletedLines(currentBoard, completedLines)
        setBoard(updatedBoard)
        boardRef.current = updatedBoard

        // Update score and level
        const newLines = stats.lines + completedLines.length
        const newLevel = Math.floor(newLines / 10) + 1

        // Calculate score based on number of lines cleared
        const lineScore =
          SCORING.linesClear[completedLines.length as keyof typeof SCORING.linesClear] || completedLines.length * 300

        // Add score for lines cleared
        addToScore(lineScore * stats.level)

        const newStats = {
          ...stats,
          lines: newLines,
          level: newLevel,
        }

        setStats(newStats)

        // Log lines cleared
        loggingService.logEvent(
          "linesCleared",
          {
            lineCount: completedLines.length,
            lineIndices: completedLines,
            scoreAdded: lineScore * stats.level,
            newLevel: newLevel > stats.level ? newLevel : null,
          },
          newStats,
          null,
          updatedBoard,
        )

        if (newLevel > stats.level) {
          // Log level up
          loggingService.logEvent(
            "levelUp",
            {
              oldLevel: stats.level,
              newLevel,
            },
            newStats,
          )
        }
      }

      // Generate a new piece
      const newNextPiece = generateRandomPiece()

      // Set next piece as current and generate new next piece
      setCurrentPiece(nextPiece)
      currentPieceRef.current = nextPiece
      setNextPiece(newNextPiece)

      // Log new current piece
      loggingService.logEvent("newCurrentPiece", { piece: nextPiece }, stats, nextPiece)

      // Log new next piece
      loggingService.logEvent("nextPieceGenerated", { piece: newNextPiece }, stats)
    } catch (error) {
      console.error("Error in lockPieceAtPosition:", error)

      // Log error
      loggingService.logEvent(
        "error",
        {
          function: "lockPieceAtPosition",
          message: error instanceof Error ? error.message : String(error),
        },
        stats,
      )
    }
  }

  // Rotate piece
  const rotatePiece = (): void => {
    if (paused || gameOver || !currentPiece) return

    // Create a new rotated shape
    const rotatedShape: CellPosition[] = currentPiece.shape.map(([x, y]) => {
      // 90-degree clockwise rotation: (x, y) -> (-y, x)
      return [-y, x] as CellPosition
    })

    const newPiece: GamePiece = {
      ...currentPiece,
      shape: rotatedShape,
    }

    let rotationSuccessful = false
    let wallKickOffset = 0

    // Try the rotation, if it doesn't work, try wall kicks
    if (isValidPosition(newPiece)) {
      setCurrentPiece(newPiece)
      currentPieceRef.current = newPiece
      rotationSuccessful = true

      // Log rotation
      loggingService.logEvent(
        "pieceRotate",
        {
          success: true,
          wallKick: false,
        },
        stats,
        newPiece,
      )

      // Check if piece can still move down after rotation
      if (isLocking && canMoveDown(newPiece)) {
        resetLockTimer()
      } else if (!isLocking && !canMoveDown(newPiece)) {
        startLockTimer()
      }
    } else {
      // Try wall kicks (move left/right to make rotation work)
      for (const offset of [-1, 1, -2, 2]) {
        const kickedPiece: GamePiece = {
          ...newPiece,
          x: newPiece.x + offset,
        }

        if (isValidPosition(kickedPiece)) {
          setCurrentPiece(kickedPiece)
          currentPieceRef.current = kickedPiece
          rotationSuccessful = true
          wallKickOffset = offset

          // Log rotation with wall kick
          loggingService.logEvent(
            "pieceRotate",
            {
              success: true,
              wallKick: true,
              offset,
            },
            stats,
            kickedPiece,
          )

          // Check if piece can still move down after rotation with wall kick
          if (isLocking && canMoveDown(kickedPiece)) {
            resetLockTimer()
          } else if (!isLocking && !canMoveDown(kickedPiece)) {
            startLockTimer()
          }

          break
        }
      }
    }

    // Log failed rotation attempt
    if (!rotationSuccessful) {
      loggingService.logEvent(
        "pieceRotate",
        {
          success: false,
          reason: "noValidPosition",
        },
        stats,
        currentPiece,
      )
    }
  }

  // Check for completed lines
  const checkCompletedLines = (boardToCheck: GameBoard): number[] => {
    const completedLines: number[] = []

    for (let y = 0; y < BOARD_HEIGHT; y++) {
      if (boardToCheck[y].every((cell) => cell !== 0)) {
        completedLines.push(y)
      }
    }

    return completedLines
  }

  // Remove completed lines and shift down
  const removeCompletedLines = (boardToCheck: GameBoard, lines: number[]): GameBoard => {
    const newBoard: GameBoard = [...boardToCheck.map((row) => [...row])]

    // Sort lines in descending order to remove from bottom to top
    const sortedLines = [...lines].sort((a, b) => b - a)

    // Remove completed lines
    for (const line of sortedLines) {
      // Remove the line and add a new empty line at the top
      newBoard.splice(line, 1)
      newBoard.unshift(Array(BOARD_WIDTH).fill(0))
    }

    return newBoard
  }

  // Toggle pause
  const togglePause = (): void => {
    if (gameOver || !gameStarted) return

    const newPausedState = !paused
    setPaused(newPausedState)

    // Log pause state change
    loggingService.logEvent(newPausedState ? "gamePaused" : "gameResumed", { timestamp: Date.now() }, stats)

    if (newPausedState) {
      // Pause game
      if (autoDropTimerRef.current) {
        clearTimeout(autoDropTimerRef.current)
      }
    } else {
      // Resume game
      gameLoop()
      startAutoDropTimer()
    }
  }

  // Game loop
  const gameLoop = (): void => {
    if (gameOver || paused) return

    // Render game
    renderGame()

    // Continue loop
    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }

  // Get color for a cell based on its value
  const getColorForCell = (cellValue: number): string => {
    if (cellValue === 0) return "#111" // Empty cell

    // Determine piece type and color index
    if (cellValue >= 20) {
      // Pentomino
      return COLORS.pentomino[cellValue - 20 - 1] || "#888"
    } else if (cellValue >= 10) {
      // Tetromino
      return COLORS.tetromino[cellValue - 10 - 1] || "#888"
    } else {
      // Tromino
      return COLORS.tromino[cellValue - 1] || "#888"
    }
  }

  // Render game
  const renderGame = (): void => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw board
    const currentBoard = boardRef.current
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const cell = currentBoard[y][x]

        if (cell !== 0) {
          ctx.fillStyle = getColorForCell(cell)
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
          ctx.strokeStyle = "#222"
          ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        } else {
          // Draw empty cell
          ctx.fillStyle = "#111"
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
          ctx.strokeStyle = "#333"
          ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        }
      }
    }

    // Draw current piece
    const currentPieceToRender = currentPieceRef.current
    if (currentPieceToRender) {
      // Use a flashing effect if the piece is locking
      let pieceColor = currentPieceToRender.color

      if (isLocking) {
        // Calculate remaining lock time
        const remainingTime = Math.max(0, lockTimeRef.current - Date.now())
        const lockProgress = remainingTime / LOCK_DELAY

        // Flash faster as time runs out
        const flashRate = 100 + Math.floor(400 * lockProgress)
        const flashPhase = Math.floor(Date.now() / flashRate) % 2

        if (flashPhase === 0) {
          pieceColor = "#fff" // Flash white
        }
      }

      ctx.fillStyle = pieceColor

      for (const [x, y] of currentPieceToRender.shape) {
        const boardX = currentPieceToRender.x + x
        const boardY = currentPieceToRender.y + y

        if (boardY >= 0) {
          ctx.fillRect(boardX * CELL_SIZE, boardY * CELL_SIZE, CELL_SIZE, CELL_SIZE)
          ctx.strokeStyle = "#222"
          ctx.strokeRect(boardX * CELL_SIZE, boardY * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        }
      }

      // Draw ghost piece (preview of where piece will land) if not locking
      if (!isLocking) {
        let ghostY = currentPieceToRender.y

        // Find the lowest valid position
        while (true) {
          ghostY++
          const testPiece: GamePiece = {
            ...currentPieceToRender,
            y: ghostY,
          }

          if (!isValidPosition(testPiece)) {
            ghostY--
            break
          }
        }

        if (ghostY !== currentPieceToRender.y) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.2)"

          for (const [x, y] of currentPieceToRender.shape) {
            const boardX = currentPieceToRender.x + x
            const boardY = ghostY + y

            if (boardY >= 0) {
              ctx.fillRect(boardX * CELL_SIZE, boardY * CELL_SIZE, CELL_SIZE, CELL_SIZE)
              ctx.strokeStyle = "#222"
              ctx.strokeRect(boardX * CELL_SIZE, boardY * CELL_SIZE, CELL_SIZE, CELL_SIZE)
            }
          }
        }
      }

      // Draw lock timer if piece is locking
      if (isLocking) {
        const remainingTime = Math.max(0, lockTimeRef.current - Date.now()) / 1000
        ctx.fillStyle = "#fff"
        ctx.font = "16px Arial"
        ctx.textAlign = "center"
        ctx.fillText(`Lock in: ${remainingTime.toFixed(1)}s`, canvas.width / 2, 20)
      }
    }

    // Draw game over or paused overlay
    if (gameOver || paused) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "#fff"
      ctx.font = "24px Arial"
      ctx.textAlign = "center"
      ctx.fillText(gameOver ? "Game Over" : "Paused", canvas.width / 2, canvas.height / 2)
    }

    // Draw score popup if points were just earned
    if (lastMoveScoreRef.current > 0) {
      ctx.fillStyle = "#FFEB3B"
      ctx.font = "bold 18px Arial"
      ctx.textAlign = "center"
      ctx.fillText(`+${lastMoveScoreRef.current}`, canvas.width / 2, canvas.height / 2 - 40)

      // Clear the score popup after a short delay
      setTimeout(() => {
        lastMoveScoreRef.current = 0
      }, 500)
    }
  }

  // Set up keyboard controls
  useGameControls({
    moveLeft,
    moveRight,
    moveDown,
    hardDrop,
    rotatePiece,
    togglePause,
    isActive: gameStarted && !gameOver,
  })

  // Initialize canvas and start rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas dimensions
    canvas.width = BOARD_WIDTH * CELL_SIZE
    canvas.height = BOARD_HEIGHT * CELL_SIZE

    // Initial render
    renderGame()

    // Cleanup
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
      if (lockTimerRef.current) {
        clearTimeout(lockTimerRef.current)
      }
      if (autoDropTimerRef.current) {
        clearTimeout(autoDropTimerRef.current)
      }

      // End logging session if game is in progress
      if (gameStarted && !gameOver) {
        loggingService.endSession(stats)
      }
    }
  }, [])

  // Restart auto drop timer when a new piece is generated
  useEffect(() => {
    if (gameStarted && !paused && !gameOver && currentPiece) {
      if (autoDropTimerRef.current) {
        clearTimeout(autoDropTimerRef.current)
      }
      startAutoDropTimer()
    }
  }, [currentPiece, gameStarted, paused, gameOver])

  // Log game over when it happens
  useEffect(() => {
    if (gameOver && gameStarted) {
      loggingService.endSession(stats)
    }
  }, [gameOver, gameStarted, stats])

  // Get piece type label
  const getPieceTypeLabel = (piece: GamePiece | null): string => {
    if (!piece) return ""

    switch (piece.pieceType) {
      case "tromino":
        return "Tromino"
      case "tetromino":
        return "Tetromino"
      case "pentomino":
        return "Pentomino"
      default:
        return ""
    }
  }

  // Render next piece preview
  const renderNextPiece = () => {
    if (!nextPiece) return null

    // Find the dimensions of the next piece
    let minX = Number.POSITIVE_INFINITY,
      maxX = Number.NEGATIVE_INFINITY,
      minY = Number.POSITIVE_INFINITY,
      maxY = Number.NEGATIVE_INFINITY

    for (const [x, y] of nextPiece.shape) {
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
    }

    const width = maxX - minX + 1
    const height = maxY - minY + 1

    return (
      <div className="bg-gray-800 p-4 rounded-md">
        <h3 className="text-lg font-medium mb-1 text-white">Next Piece</h3>
        <p className="text-sm text-gray-300 mb-2">{getPieceTypeLabel(nextPiece)}</p>
        <div
          className="grid gap-px"
          style={{
            gridTemplateColumns: `repeat(${width}, 20px)`,
            gridTemplateRows: `repeat(${height}, 20px)`,
          }}
        >
          {Array(height)
            .fill(0)
            .map((_, y) =>
              Array(width)
                .fill(0)
                .map((_, x) => {
                  const hasPiece = nextPiece.shape.some(
                    ([pieceX, pieceY]) => pieceX - minX === x && pieceY - minY === y,
                  )

                  return (
                    <div
                      key={`${x}-${y}`}
                      className={`w-5 h-5 ${hasPiece ? "" : "bg-gray-900"}`}
                      style={hasPiece ? { backgroundColor: nextPiece.color } : {}}
                    />
                  )
                }),
            )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 items-center">
      <div className="relative">
        <canvas ref={canvasRef} className="border-2 border-gray-700 bg-gray-800" />

        {!gameStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
            <Button onClick={initGame} className="text-lg px-6 py-3">
              Start Game
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {renderNextPiece()}

        <div className="bg-gray-800 p-4 rounded-md text-white">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="text-lg font-medium text-gray-400">Score</h3>
              <p className="text-2xl font-bold">{stats.score}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-400">Level</h3>
              <p className="text-2xl font-bold">{stats.level}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-400">Lines</h3>
              <p className="text-2xl font-bold">{stats.lines}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={togglePause} disabled={!gameStarted || gameOver} className="flex-1">
            {paused ? "Resume" : "Pause"}
          </Button>

          <Button onClick={initGame} variant="destructive" className="flex-1">
            {gameOver ? "Restart" : "New Game"}
          </Button>
        </div>

        <div className="bg-gray-800 p-4 rounded-md text-white">
          <h3 className="text-lg font-medium mb-2">Controls</h3>
          <ul className="text-sm space-y-1">
            <li>← → : Move left/right</li>
            <li>↓ : Move down</li>
            <li>↑ : Rotate</li>
            <li>Space : Hard drop</li>
            <li>P : Pause/Resume</li>
          </ul>
        </div>
  
        <LogDownloader />
      </div>

      <MobileControls
        moveLeft={moveLeft}
        moveRight={moveRight}
        moveDown={moveDown}
        hardDrop={hardDrop}
        rotatePiece={rotatePiece}
        isActive={gameStarted && !gameOver && !paused}
      />
    </div>
  )
}
