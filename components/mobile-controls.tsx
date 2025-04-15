"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, ArrowDown, RotateCcw, ChevronDown } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

interface MobileControlsProps {
  moveLeft: () => void
  moveRight: () => void
  moveDown: () => void
  hardDrop: () => void
  rotatePiece: () => void
  isActive: boolean
}

export default function MobileControls({
  moveLeft,
  moveRight,
  moveDown,
  hardDrop,
  rotatePiece,
  isActive,
}: MobileControlsProps) {
  const isMobile = useMobile()

  if (!isMobile) return null

  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
      <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 flex gap-4">
        {/* Movement controls */}
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/10 hover:bg-white/20"
              onTouchStart={(e) => {
                e.preventDefault()
                if (isActive) moveLeft()
              }}
              disabled={!isActive}
            >
              <ArrowLeft className="h-6 w-6" />
              <span className="sr-only">Move Left</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/10 hover:bg-white/20"
              onTouchStart={(e) => {
                e.preventDefault()
                if (isActive) moveDown()
              }}
              disabled={!isActive}
            >
              <ArrowDown className="h-6 w-6" />
              <span className="sr-only">Move Down</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/10 hover:bg-white/20"
              onTouchStart={(e) => {
                e.preventDefault()
                if (isActive) moveRight()
              }}
              disabled={!isActive}
            >
              <ArrowRight className="h-6 w-6" />
              <span className="sr-only">Move Right</span>
            </Button>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/10 hover:bg-white/20"
            onTouchStart={(e) => {
              e.preventDefault()
              if (isActive) rotatePiece()
            }}
            disabled={!isActive}
          >
            <RotateCcw className="h-6 w-6" />
            <span className="sr-only">Rotate</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/10 hover:bg-white/20"
            onTouchStart={(e) => {
              e.preventDefault()
              if (isActive) hardDrop()
            }}
            disabled={!isActive}
          >
            <ChevronDown className="h-6 w-6" />
            <span className="sr-only">Hard Drop</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

