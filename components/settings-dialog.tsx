import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { useGameSettings } from "@/hooks/use-game-settings"
import { Settings } from "lucide-react"

export function SettingsDialog() {
  const { settings, updateSetting, resetSettings } = useGameSettings()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Game Settings</DialogTitle>
          <DialogDescription>
            Customize your Pentris experience. Settings are saved automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="sound-effects">Sound Effects</Label>
            <Switch
              id="sound-effects"
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="music">Background Music</Label>
            <Switch
              id="music"
              checked={settings.musicEnabled}
              onCheckedChange={(checked) => updateSetting('musicEnabled', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="ghost-piece">Ghost Piece</Label>
            <Switch
              id="ghost-piece"
              checked={settings.ghostPieceEnabled}
              onCheckedChange={(checked) => updateSetting('ghostPieceEnabled', checked)}
            />
          </div>
          <div className="space-y-2">
            <Label>Starting Level (1-10)</Label>
            <Slider
              value={[settings.startLevel]}
              onValueChange={([value]) => updateSetting('startLevel', value)}
              min={1}
              max={10}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <Label>Drop Speed</Label>
            <div className="flex gap-2">
              {(['normal', 'fast', 'faster'] as const).map((speed) => (
                <Button
                  key={speed}
                  variant={settings.dropSpeed === speed ? "default" : "outline"}
                  onClick={() => updateSetting('dropSpeed', speed)}
                  className="flex-1 capitalize"
                >
                  {speed}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={resetSettings}>
            Reset to Default
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}