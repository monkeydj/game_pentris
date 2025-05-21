"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Card } from "@/components/ui/card"
import {
  createEmptyBoard,
  checkCollision,
  addPieceToBoard,
  clearFullRows,
  createRandomPiece,
  rotateMatrix,
} from "@/lib/game-utils"
import GameBoard from "@/components/game-board"
import NextPieceDisplay from "@/components/next-piece-display"
import ScoreDisplay from "@/components/score-display"
import GameControls from "@/components/game-controls"

export default function PentrisGame() {
  // Game board dimensions
  const BOARD_WIDTH = 10
  const BOARD_HEIGHT = 20

  // Game state
  const [board, setBoard] = useState(() => createEmptyBoard(BOARD_WIDTH, BOARD_HEIGHT))
  const [currentPiece, setCurrentPiece] = useState(() => createRandomPiece())
  const [nextPiece, setNextPiece] = useState(() => createRandomPiece())
  const [position, setPosition] = useState({ x: Math.floor(BOARD_WIDTH / 2) - 2, y: 0 })
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [linesCleared, setLinesCleared] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  // Game loop with requestAnimationFrame
  const lastTimeRef = useRef<number>(0)
  const dropSpeedRef = useRef<number>(1000) // Initial drop speed in ms
  const animationFrameRef = useRef<number>()

  // Calculate drop speed based on level
  useEffect(() => {
    dropSpeedRef.current = Math.max(100, 1000 - (level - 1) * 100)
  }, [level])

  // Update level based on lines cleared
  useEffect(() => {
    setLevel(Math.floor(linesCleared / 10) + 1)
  }, [linesCleared])

  // Move piece down
  const moveDown = useCallback(() => {
    if (gameOver || isPaused) return

    const newY = position.y + 1

    if (!checkCollision(board, currentPiece, { x: position.x, y: newY })) {
      setPosition((prev) => ({ ...prev, y: newY }))
    } else {
      // Piece has landed
      const newBoard = addPieceToBoard(board, currentPiece, position)
      const { clearedBoard, rowsCleared } = clearFullRows(newBoard)

      // Update score
      if (rowsCleared > 0) {
        const pointsPerLine = [0, 100, 300, 500, 800]
        const points = pointsPerLine[rowsCleared] * level
        setScore((prev) => prev + points)
        setLinesCleared((prev) => prev + rowsCleared)
      }

      setBoard(clearedBoard)

      // Check for game over
      if (position.y <= 1) {
        setGameOver(true)
        return
      }

      // Set next piece
      setCurrentPiece(nextPiece)
      setNextPiece(createRandomPiece())
      setPosition({ x: Math.floor(BOARD_WIDTH / 2) - 2, y: 0 })
    }
  }, [board, currentPiece, position, gameOver, isPaused, nextPiece, level])

  // Game loop using requestAnimationFrame
  const gameLoop = useCallback((timestamp: number) => {
    if (gameOver || isPaused) return

    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp
    }

    const elapsed = timestamp - lastTimeRef.current

    if (elapsed > dropSpeedRef.current) {
      moveDown()
      lastTimeRef.current = timestamp
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, [gameOver, isPaused, moveDown])

  // Start/stop game loop
  useEffect(() => {
    if (!gameOver && !isPaused) {
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameLoop, gameOver, isPaused])

  // Move piece left
  const moveLeft = useCallback(() => {
    if (gameOver || isPaused) return

    const newX = position.x - 1
    if (!checkCollision(board, currentPiece, { x: newX, y: position.y })) {
      setPosition((prev) => ({ ...prev, x: newX }))
    }
  }, [board, currentPiece, position, gameOver, isPaused])

  // Move piece right
  const moveRight = useCallback(() => {
    if (gameOver || isPaused) return

    const newX = position.x + 1
    if (!checkCollision(board, currentPiece, { x: newX, y: position.y })) {
      setPosition((prev) => ({ ...prev, x: newX }))
    }
  }, [board, currentPiece, position, gameOver, isPaused])

  // Rotate piece
  const rotatePiece = useCallback(() => {
    if (gameOver || isPaused) return

    const rotatedPiece = rotateMatrix(currentPiece)
    if (!checkCollision(board, rotatedPiece, position)) {
      setCurrentPiece(rotatedPiece)
    } else {
      // Try wall kicks - attempt to move the piece if rotation would cause collision
      const kicks = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: -1 },
        { x: 2, y: 0 },
        { x: -2, y: 0 },
      ]

      for (const kick of kicks) {
        const newPos = { x: position.x + kick.x, y: position.y + kick.y }
        if (!checkCollision(board, rotatedPiece, newPos)) {
          setCurrentPiece(rotatedPiece)
          setPosition(newPos)
          break
        }
      }
    }
  }, [board, currentPiece, position, gameOver, isPaused])

  // Hard drop
  const hardDrop = useCallback(() => {
    if (gameOver || isPaused) return

    let newY = position.y
    while (!checkCollision(board, currentPiece, { x: position.x, y: newY + 1 })) {
      newY++
    }

    setPosition((prev) => ({ ...prev, y: newY }))
    moveDown()
  }, [board, currentPiece, position, moveDown, gameOver, isPaused])

  // Handle keyboard input with debouncing
  const lastKeyPressRef = useRef<number>(0)
  const KEY_PRESS_DELAY = 50 // ms

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return

      const now = Date.now()
      if (now - lastKeyPressRef.current < KEY_PRESS_DELAY) return
      lastKeyPressRef.current = now

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          moveLeft()
          break
        case "ArrowRight":
          e.preventDefault()
          moveRight()
          break
        case "ArrowDown":
          e.preventDefault()
          moveDown()
          break
        case "ArrowUp":
          e.preventDefault()
          rotatePiece()
          break
        case " ":
          e.preventDefault()
          hardDrop()
          break
        case "p":
        case "P":
          e.preventDefault()
          setIsPaused((prev) => !prev)
          break
        default:
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [moveLeft, moveRight, moveDown, rotatePiece, hardDrop, gameOver])

  // Reset game
  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard(BOARD_WIDTH, BOARD_HEIGHT))
    setCurrentPiece(createRandomPiece())
    setNextPiece(createRandomPiece())
    setPosition({ x: Math.floor(BOARD_WIDTH / 2) - 2, y: 0 })
    setScore(0)
    setLevel(1)
    setLinesCleared(0)
    setGameOver(false)
    setIsPaused(false)
    lastTimeRef.current = 0
  }, [])

  // Toggle pause
  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev)
  }, [])

  return (
    <div className="flex flex-col md:flex-row gap-6 items-center">
      <Card className="p-4 bg-gray-800 border-gray-700">
        <GameBoard
          board={board}
          currentPiece={currentPiece}
          position={position}
          gameOver={gameOver}
          isPaused={isPaused}
        />
      </Card>

      <div className="flex flex-col gap-4">
        <Card className="p-4 bg-gray-800 border-gray-700">
          <NextPieceDisplay piece={nextPiece} />
        </Card>

        <Card className="p-4 bg-gray-800 border-gray-700">
          <ScoreDisplay score={score} level={level} linesCleared={linesCleared} />
        </Card>

        <Card className="p-4 bg-gray-800 border-gray-700">
          <GameControls
            onMoveLeft={moveLeft}
            onMoveRight={moveRight}
            onMoveDown={moveDown}
            onRotate={rotatePiece}
            onHardDrop={hardDrop}
            onPause={togglePause}
            onReset={resetGame}
            isPaused={isPaused}
            gameOver={gameOver}
          />
        </Card>
      </div>
    </div>
  )
}
