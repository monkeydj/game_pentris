import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trophy } from "lucide-react"
import { useHighScores } from "@/hooks/use-high-scores"

export function HighScoresDialog() {
  const { highScores, clearHighScores } = useHighScores()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trophy className="h-5 w-5" />
          <span className="sr-only">High Scores</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>High Scores</DialogTitle>
          <DialogDescription>
            Top 10 highest scores in Pentris
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {highScores.length > 0 ? (
            <>
              <div className="grid grid-cols-4 font-medium text-sm">
                <div>Rank</div>
                <div>Score</div>
                <div>Level</div>
                <div>Date</div>
              </div>
              <div className="space-y-2">
                {highScores.map((score, index) => (
                  <div key={index} className="grid grid-cols-4 text-sm">
                    <div>{index + 1}</div>
                    <div>{score.score.toLocaleString()}</div>
                    <div>{score.level}</div>
                    <div>{new Date(score.date).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  variant="destructive"
                  onClick={clearHighScores}
                >
                  Clear High Scores
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No high scores yet. Start playing to set some records!
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}