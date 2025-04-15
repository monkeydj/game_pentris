"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { BOARD_WIDTH, BOARD_HEIGHT, CELL_SIZE, COLORS } from "@/lib/constants"
import { createPentominoShapes } from "@/lib/pentomino-shapes"
import { useGameControls } from "@/hooks/use-game-controls"
import MobileControls from "./mobile-controls"

export default function PentrisGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lines, setLines] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [paused, setPaused] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [isLocking, setIsLocking] = useState(false)
  const lockTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lockTimeRef = useRef<number>(0)
  const currentPieceRef = useRef<any>(null)
  const boardRef = useRef<number[][]>([])
  const LOCK_DELAY = 1500 // 1.5 seconds in milliseconds

  // Game state
  const [board, setBoard] = useState<number[][]>(() => {
    const initialBoard = Array(BOARD_HEIGHT)
      .fill(0)
      .map(() => Array(BOARD_WIDTH).fill(0))
    boardRef.current = initialBoard
    return initialBoard
  })
  const [currentPiece, setCurrentPiece] = useState<any>(null)
  const [nextPiece, setNextPiece] = useState<any>(null)

  const pentominoShapes = createPentominoShapes()

  // Game loop reference
  const gameLoopRef = useRef<number | null>(null)
  const lastMoveDownTime = useRef<number>(0)
  const moveDownInterval = useRef<number>(1000)

  // Update currentPieceRef when currentPiece changes
  useEffect(() => {
    currentPieceRef.current = currentPiece
  }, [currentPiece])

  // Update boardRef when board changes
  useEffect(() => {
    boardRef.current = board
  }, [board])

  // Initialize game
  const initGame = () => {
    const initialBoard = Array(BOARD_HEIGHT)
      .fill(0)
      .map(() => Array(BOARD_WIDTH).fill(0))

    setBoard(initialBoard)
    boardRef.current = initialBoard

    setScore(0)
    setLevel(1)
    setLines(0)
    setGameOver(false)
    setPaused(false)
    setGameStarted(true)
    setIsLocking(false)

    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current)
      lockTimerRef.current = null
    }

    // Generate first pieces
    const firstPiece = generateRandomPiece()
    const secondPiece = generateRandomPiece()
    setCurrentPiece(firstPiece)
    currentPieceRef.current = firstPiece
    setNextPiece(secondPiece)

    // Set initial speed based on level
    moveDownInterval.current = 1000 - (level - 1) * 50

    // Start game loop
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    lastMoveDownTime.current = performance.now()
    gameLoop()
  }

  // Generate a random pentomino piece
  const generateRandomPiece = () => {
    // Get only the shape keys (not including the getTypeIndex function)
    const shapeKeys = Object.keys(pentominoShapes.shapes)
    const randomKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)]
    const shape = pentominoShapes.shapes[randomKey as keyof typeof pentominoShapes.shapes]

    // Find the width of the shape
    let maxX = 0
    for (const [x, y] of shape) {
      maxX = Math.max(maxX, x)
    }

    return {
      shape: shape,
      x: Math.floor(BOARD_WIDTH / 2) - Math.ceil(maxX / 2),
      y: 0,
      type: randomKey,
    }
  }

  // Check if the current position is valid
  const isValidPosition = (piece: any, boardToCheck: number[][] = boardRef.current) => {
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
  const canMoveDown = (piece: any) => {
    const testPiece = {
      ...piece,
      y: piece.y + 1,
    }
    return isValidPosition(testPiece)
  }

  // Move piece left
  const moveLeft = () => {
    if (paused || gameOver || !currentPiece) return

    const newPiece = {
      ...currentPiece,
      x: currentPiece.x - 1,
    }

    if (isValidPosition(newPiece)) {
      setCurrentPiece(newPiece)
      currentPieceRef.current = newPiece

      // Reset lock timer if piece is at bottom but moved
      if (isLocking && !canMoveDown(newPiece)) {
        resetLockTimer()
      }
    }
  }

  // Move piece right
  const moveRight = () => {
    if (paused || gameOver || !currentPiece) return

    const newPiece = {
      ...currentPiece,
      x: currentPiece.x + 1,
    }

    if (isValidPosition(newPiece)) {
      setCurrentPiece(newPiece)
      currentPieceRef.current = newPiece

      // Reset lock timer if piece is at bottom but moved
      if (isLocking && !canMoveDown(newPiece)) {
        resetLockTimer()
      }
    }
  }

  // Move piece down
  const moveDown = () => {
    if (paused || gameOver || !currentPiece) return

    const newPiece = {
      ...currentPiece,
      y: currentPiece.y + 1,
    }

    if (isValidPosition(newPiece)) {
      setCurrentPiece(newPiece)
      currentPieceRef.current = newPiece
      return true
    } else {
      // Piece can't move down further, start lock delay
      if (!isLocking) {
        startLockTimer()
      }
      return false
    }
  }

  // Start the lock timer
  const startLockTimer = () => {
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current)
    }

    setIsLocking(true)
    lockTimeRef.current = Date.now() + LOCK_DELAY

    lockTimerRef.current = setTimeout(() => {
      // Make sure we're still in a valid game state
      if (!gameOver && !paused) {
        finalizeLock()
      }
    }, LOCK_DELAY)
  }

  // Reset the lock timer
  const resetLockTimer = () => {
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current)

      lockTimeRef.current = Date.now() + LOCK_DELAY

      lockTimerRef.current = setTimeout(() => {
        // Make sure we're still in a valid game state
        if (!gameOver && !paused) {
          finalizeLock()
        }
      }, LOCK_DELAY)
    }
  }

  // Finalize the locking process
  const finalizeLock = () => {
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

  // Hard drop piece
  const hardDrop = () => {
    if (paused || gameOver || !currentPiece) return

    let newY = currentPiece.y

    // Find the lowest valid position
    while (true) {
      newY++
      const testPiece = {
        ...currentPiece,
        y: newY,
      }

      if (!isValidPosition(testPiece)) {
        newY--
        break
      }
    }

    // Create a new piece at the lowest position
    const droppedPiece = {
      ...currentPiece,
      y: newY,
    }

    // Update the current piece position
    setCurrentPiece(droppedPiece)
    currentPieceRef.current = droppedPiece

    // Start the lock timer
    startLockTimer()
  }

  // Lock a piece at a specific position
  const lockPieceAtPosition = (piece: any) => {
    if (!piece) return

    try {
      // Create a new board with the locked piece
      const currentBoard = [...boardRef.current.map((row) => [...row])]

      // Add the piece to the board
      for (const [x, y] of piece.shape) {
        const boardX = piece.x + x
        const boardY = piece.y + y

        if (boardY < 0) {
          // Game over if piece is locked above the board
          setGameOver(true)
          return
        }

        currentBoard[boardY][boardX] = pentominoShapes.getTypeIndex(piece.type)
      }

      // Update the board with the locked piece
      setBoard(currentBoard)
      boardRef.current = currentBoard

      // Check for completed lines
      const completedLines = checkCompletedLines(currentBoard)
      if (completedLines.length > 0) {
        const updatedBoard = removeCompletedLines(currentBoard, completedLines)
        setBoard(updatedBoard)
        boardRef.current = updatedBoard

        // Update score and level
        const newLines = lines + completedLines.length
        const newLevel = Math.floor(newLines / 10) + 1

        // Calculate score based on number of lines cleared
        let lineScore = 0
        switch (completedLines.length) {
          case 1:
            lineScore = 100
            break
          case 2:
            lineScore = 300
            break
          case 3:
            lineScore = 500
            break
          case 4:
            lineScore = 800
            break
          default:
            lineScore = completedLines.length * 300
            break
        }

        const newScore = score + lineScore * level

        setLines(newLines)
        setScore(newScore)

        if (newLevel > level) {
          setLevel(newLevel)
          moveDownInterval.current = Math.max(100, 1000 - (newLevel - 1) * 50)
        }
      }

      // Generate a new piece
      const newNextPiece = generateRandomPiece()

      // Set next piece as current and generate new next piece
      setCurrentPiece(nextPiece)
      currentPieceRef.current = nextPiece
      setNextPiece(newNextPiece)
    } catch (error) {
      console.error("Error in lockPieceAtPosition:", error)
    }
  }

  // Lock the current piece in place and generate a new one
  const lockPiece = () => {
    if (!currentPiece) return
    lockPieceAtPosition(currentPiece)
  }

  // Rotate piece
  const rotatePiece = () => {
    if (paused || gameOver || !currentPiece) return

    // Create a new rotated shape
    const rotatedShape = currentPiece.shape.map(([x, y]: [number, number]) => {
      // 90-degree clockwise rotation: (x, y) -> (-y, x)
      return [-y, x]
    })

    const newPiece = {
      ...currentPiece,
      shape: rotatedShape,
    }

    // Try the rotation, if it doesn't work, try wall kicks
    if (isValidPosition(newPiece)) {
      setCurrentPiece(newPiece)
      currentPieceRef.current = newPiece

      // Reset lock timer if piece is at bottom but rotated
      if (isLocking && !canMoveDown(newPiece)) {
        resetLockTimer()
      }
    } else {
      // Try wall kicks (move left/right to make rotation work)
      for (const offset of [-1, 1, -2, 2]) {
        const kickedPiece = {
          ...newPiece,
          x: newPiece.x + offset,
        }

        if (isValidPosition(kickedPiece)) {
          setCurrentPiece(kickedPiece)
          currentPieceRef.current = kickedPiece

          // Reset lock timer if piece is at bottom but rotated with wall kick
          if (isLocking && !canMoveDown(kickedPiece)) {
            resetLockTimer()
          }

          return
        }
      }
    }
  }

  // Check for completed lines
  const checkCompletedLines = (boardToCheck: number[][]) => {
    const completedLines: number[] = []

    for (let y = 0; y < BOARD_HEIGHT; y++) {
      if (boardToCheck[y].every((cell) => cell !== 0)) {
        completedLines.push(y)
      }
    }

    return completedLines
  }

  // Remove completed lines and shift down
  const removeCompletedLines = (boardToCheck: number[][], lines: number[]) => {
    const newBoard = [...boardToCheck.map((row) => [...row])]

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
  const togglePause = () => {
    if (gameOver || !gameStarted) return

    setPaused(!paused)
    if (paused) {
      // Resume game
      lastMoveDownTime.current = performance.now()
      gameLoop()
    }
  }

  // Game loop
  const gameLoop = () => {
    if (gameOver || paused) return

    const now = performance.now()
    const deltaTime = now - lastMoveDownTime.current

    if (deltaTime > moveDownInterval.current && !isLocking) {
      moveDown()
      lastMoveDownTime.current = now
    }

    // Render game
    renderGame()

    // Continue loop
    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }

  // Render game
  const renderGame = () => {
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
          ctx.fillStyle = COLORS[cell - 1] || "#888"
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
      let pieceColor = COLORS[pentominoShapes.getTypeIndex(currentPieceToRender.type) - 1] || "#888"

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
          const testPiece = {
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
    }
  }, [])

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
        <h3 className="text-lg font-medium mb-2 text-white">Next Piece</h3>
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
                    ([pieceX, pieceY]: [number, number]) => pieceX - minX === x && pieceY - minY === y,
                  )

                  return <div key={`${x}-${y}`} className={`w-5 h-5 ${hasPiece ? "bg-gray-500" : "bg-gray-900"}`} />
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
          <div className="mb-2">
            <h3 className="text-lg font-medium">Score</h3>
            <p className="text-2xl font-bold">{score}</p>
          </div>

          <div className="mb-2">
            <h3 className="text-lg font-medium">Level</h3>
            <p className="text-2xl font-bold">{level}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium">Lines</h3>
            <p className="text-2xl font-bold">{lines}</p>
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
