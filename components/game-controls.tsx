"use client"

import { Button } from "@/components/ui/button"
import { ArrowDown, ArrowLeft, ArrowRight, RotateCw, ChevronDown, Pause, Play, RefreshCw } from "lucide-react"

interface GameControlsProps {
  onMoveLeft: () => void
  onMoveRight: () => void
  onMoveDown: () => void
  onRotate: () => void
  onHardDrop: () => void
  onPause: () => void
  onReset: () => void
  isPaused: boolean
  gameOver: boolean
}

export default function GameControls({
  onMoveLeft,
  onMoveRight,
  onMoveDown,
  onRotate,
  onHardDrop,
  onPause,
  onReset,
  isPaused,
  gameOver,
}: GameControlsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-white text-lg font-medium mb-2">Controls</h3>

      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onMoveLeft}
          disabled={gameOver}
          className="bg-gray-700 hover:bg-gray-600"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onMoveDown}
          disabled={gameOver}
          className="bg-gray-700 hover:bg-gray-600"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onMoveRight}
          disabled={gameOver}
          className="bg-gray-700 hover:bg-gray-600"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onRotate}
          disabled={gameOver}
          className="bg-gray-700 hover:bg-gray-600"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onHardDrop}
          disabled={gameOver}
          className="bg-gray-700 hover:bg-gray-600"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onPause}
          disabled={gameOver}
          className="bg-gray-700 hover:bg-gray-600"
        >
          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </Button>
      </div>

      <Button variant="default" onClick={onReset} className="w-full bg-red-600 hover:bg-red-700">
        <RefreshCw className="h-4 w-4 mr-2" />
        Reset
      </Button>

      <div className="text-xs text-gray-400 mt-2">
        <p>Arrow keys to move</p>
        <p>Up arrow to rotate</p>
        <p>Space for hard drop</p>
        <p>P to pause</p>
      </div>
    </div>
  )
}
