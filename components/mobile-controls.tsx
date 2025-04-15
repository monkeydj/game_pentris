"use client"

import { Button } from "@/components/ui/button"
import { ArrowDown, ArrowLeft, ArrowRight, RotateCcw, ChevronDown } from "lucide-react"

interface MobileControlsProps {
  moveLeft: () => void
  moveRight: () => void
  moveDown: () => void | boolean
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
  if (!isActive) return null

  return (
    <div className="grid grid-cols-3 gap-2 mt-4 md:hidden">
      <Button variant="outline" size="icon" onClick={moveLeft} className="h-14 w-14">
        <ArrowLeft className="h-6 w-6" />
      </Button>

      <div className="grid grid-rows-2 gap-2">
        <Button variant="outline" size="icon" onClick={rotatePiece} className="h-14 w-full">
          <RotateCcw className="h-6 w-6" />
        </Button>

        <Button variant="outline" size="icon" onClick={moveDown} className="h-14 w-full">
          <ArrowDown className="h-6 w-6" />
        </Button>
      </div>

      <Button variant="outline" size="icon" onClick={moveRight} className="h-14 w-14">
        <ArrowRight className="h-6 w-6" />
      </Button>

      <Button variant="outline" onClick={hardDrop} className="col-span-3 h-14">
        <ChevronDown className="h-6 w-6 mr-2" />
        Hard Drop
      </Button>
    </div>
  )
}
