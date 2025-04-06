"use client"

import { useEffect } from "react"

interface GameControlsProps {
  moveLeft: () => void
  moveRight: () => void
  moveDown: () => void
  hardDrop: () => void
  rotatePiece: () => void
  togglePause: () => void
  isActive: boolean
}

export function useGameControls({
  moveLeft,
  moveRight,
  moveDown,
  hardDrop,
  rotatePiece,
  togglePause,
  isActive,
}: GameControlsProps) {
  useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for game controls
      if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " ", "p", "P"].includes(e.key)) {
        e.preventDefault()
      }

      switch (e.key) {
        case "ArrowLeft":
          moveLeft()
          break
        case "ArrowRight":
          moveRight()
          break
        case "ArrowDown":
          moveDown()
          break
        case "ArrowUp":
          rotatePiece()
          break
        case " ":
          hardDrop()
          break
        case "p":
        case "P":
          togglePause()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isActive, moveLeft, moveRight, moveDown, hardDrop, rotatePiece, togglePause])

  return null
}

