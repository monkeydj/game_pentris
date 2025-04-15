import { useState, useEffect } from 'react';

interface HighScore {
  score: number;
  lines: number;
  level: number;
  date: string;
}

const LOCAL_STORAGE_KEY = 'pentris-high-scores';
const MAX_HIGH_SCORES = 10;

export function useHighScores() {
  const [highScores, setHighScores] = useState<HighScore[]>([]);

  // Load high scores from localStorage on mount
  useEffect(() => {
    const savedScores = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedScores) {
      try {
        setHighScores(JSON.parse(savedScores));
      } catch (error) {
        console.error('Failed to parse high scores:', error);
        setHighScores([]);
      }
    }
  }, []);

  // Save new high score
  const saveHighScore = (score: number, lines: number, level: number) => {
    const newScore: HighScore = {
      score,
      lines,
      level,
      date: new Date().toISOString(),
    };

    const updatedScores = [...highScores, newScore]
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_HIGH_SCORES);

    setHighScores(updatedScores);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedScores));

    // Return true if this is a new high score (in top 10)
    return updatedScores.some(s => s === newScore);
  };

  // Check if a score would be a high score
  const isHighScore = (score: number) => {
    return highScores.length < MAX_HIGH_SCORES || score > (highScores[highScores.length - 1]?.score ?? 0);
  };

  // Clear all high scores
  const clearHighScores = () => {
    setHighScores([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return {
    highScores,
    saveHighScore,
    isHighScore,
    clearHighScores,
  };
}