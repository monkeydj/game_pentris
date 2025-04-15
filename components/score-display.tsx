interface ScoreDisplayProps {
  score: number
  level: number
  linesCleared: number
}

export default function ScoreDisplay({ score, level, linesCleared }: ScoreDisplayProps) {
  return (
    <div className="text-white">
      <h3 className="text-lg font-medium mb-2">Stats</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Score:</span>
          <span className="font-mono">{score}</span>
        </div>
        <div className="flex justify-between">
          <span>Level:</span>
          <span className="font-mono">{level}</span>
        </div>
        <div className="flex justify-between">
          <span>Lines:</span>
          <span className="font-mono">{linesCleared}</span>
        </div>
      </div>
    </div>
  )
}
