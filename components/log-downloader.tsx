"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { loggingService } from "@/lib/logging-service"
import { Download, BarChart2 } from "lucide-react"

export default function LogDownloader() {
  const [showStats, setShowStats] = useState(false)
  const logs = loggingService.getLogs()

  // Download logs as JSON file
  const downloadLogs = () => {
    const jsonString = loggingService.generateDownloadableJSON()
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `pentris-logs-${logs.sessionId}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Toggle stats display
  const toggleStats = () => {
    setShowStats(!showStats)
  }

  // Calculate some basic stats
  const calculateStats = () => {
    if (logs.entries.length === 0) return null

    const moveEvents = logs.entries.filter((e) => e.eventType === "pieceMove").length
    const rotateEvents = logs.entries.filter((e) => e.eventType === "pieceRotate").length
    const hardDrops = logs.entries.filter((e) => e.eventType === "hardDrop").length
    const linesCleared = logs.entries
      .filter((e) => e.eventType === "linesCleared")
      .reduce((sum, e) => sum + (e.data.lineCount || 0), 0)

    return {
      totalEvents: logs.entries.length,
      moveEvents,
      rotateEvents,
      hardDrops,
      linesCleared,
      playTime: logs.endTime
        ? Math.round((new Date(logs.endTime).getTime() - new Date(logs.startTime).getTime()) / 1000)
        : Math.round((new Date().getTime() - new Date(logs.startTime).getTime()) / 1000),
    }
  }

  const stats = calculateStats()

  return (
    <div className="bg-gray-800 p-4 rounded-md text-white">
      <h3 className="text-lg font-medium mb-2">Game Data</h3>

      <div className="flex gap-2 mb-3">
        <Button
          onClick={downloadLogs}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          disabled={logs.entries.length === 0}
        >
          <Download className="h-4 w-4" />
          Download Logs
        </Button>

        <Button
          onClick={toggleStats}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          disabled={logs.entries.length === 0}
        >
          <BarChart2 className="h-4 w-4" />
          {showStats ? "Hide Stats" : "Show Stats"}
        </Button>
      </div>

      {showStats && stats && (
        <div className="text-sm bg-gray-700 p-2 rounded">
          <p>Events logged: {stats.totalEvents}</p>
          <p>Play time: {stats.playTime} seconds</p>
          <p>Moves: {stats.moveEvents}</p>
          <p>Rotations: {stats.rotateEvents}</p>
          <p>Hard drops: {stats.hardDrops}</p>
          <p>Lines cleared: {stats.linesCleared}</p>
          <p>
            Actions per minute:{" "}
            {Math.round((stats.moveEvents + stats.rotateEvents + stats.hardDrops) / (stats.playTime / 60))}
          </p>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-2">
        {logs.entries.length > 0 ? `${logs.entries.length} events logged` : "No game data available yet"}
      </p>
    </div>
  )
}
