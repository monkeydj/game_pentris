"use client"

import { useMemo } from "react"
import { addPieceToBoard } from "@/lib/game-utils"

interface GameBoardProps {
  board: number[][]
  currentPiece: number[][]
  position: { x: number; y: number }
  gameOver: boolean
  isPaused: boolean
}

export default function GameBoard({ board, currentPiece, position, gameOver, isPaused }: GameBoardProps) {
  // Combine the board and the current piece for rendering
  const displayBoard = useMemo(() => {
    if (gameOver || isPaused) {
      return board
    }
    return addPieceToBoard(board, currentPiece, position, true)
  }, [board, currentPiece, position, gameOver, isPaused])

  // Color mapping for different piece types
  const colorMap: Record<number, string> = {
    0: "bg-gray-900", // Empty cell
    1: "bg-red-500", // I piece
    2: "bg-blue-500", // J piece
    3: "bg-orange-500", // L piece
    4: "bg-yellow-500", // O piece
    5: "bg-green-500", // S piece
    6: "bg-purple-500", // T piece
    7: "bg-teal-500", // Z piece
    8: "bg-pink-500", // P piece (pentomino)
    9: "bg-indigo-500", // F piece (pentomino)
    10: "bg-emerald-500", // X piece (pentomino)
    11: "bg-amber-500", // W piece (pentomino)
    12: "bg-rose-500", // Y piece (pentomino)
    // Ghost piece (semi-transparent)
    [-1]: "bg-gray-500 bg-opacity-30 border border-gray-400",
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-10 gap-px">
        {displayBoard.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div key={`${rowIndex}-${colIndex}`} className={`w-6 h-6 ${colorMap[cell] || "bg-gray-900"}`} />
          )),
        )}
      </div>

      {gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="text-white text-center">
            <h2 className="text-2xl font-bold mb-2">Game Over</h2>
            <p>Press Reset to play again</p>
          </div>
        </div>
      )}

      {isPaused && !gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="text-white text-center">
            <h2 className="text-2xl font-bold">Paused</h2>
          </div>
        </div>
      )}
    </div>
  )
}
