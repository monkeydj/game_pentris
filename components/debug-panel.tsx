import { GAME_CONFIG } from '@/lib/game-config';

interface DebugPanelProps {
  gameState: {
    currentPiece: any;
    board: number[][];
    score: number;
    level: number;
    lines: number;
    isLocking: boolean;
    lockTimeRemaining: number;
  };
}

export function DebugPanel({ gameState }: DebugPanelProps) {
  if (!GAME_CONFIG.DEBUG.ENABLED) return null;

  return (
    <div className="fixed top-0 right-0 bg-black bg-opacity-80 text-white p-4 m-4 rounded-lg text-xs font-mono">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <p>Current Piece: {gameState.currentPiece?.type ?? 'none'}</p>
        <p>Position: ({gameState.currentPiece?.x ?? 0}, {gameState.currentPiece?.y ?? 0})</p>
        <p>Score: {gameState.score}</p>
        <p>Level: {gameState.level}</p>
        <p>Lines: {gameState.lines}</p>
        <p>Locking: {gameState.isLocking ? 'Yes' : 'No'}</p>
        {gameState.isLocking && (
          <p>Lock Time: {(gameState.lockTimeRemaining / 1000).toFixed(2)}s</p>
        )}
      </div>
    </div>
  );
}