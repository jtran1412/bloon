// src/components/GameUI.tsx
import React from 'react';

interface GameUIProps {
  money: number;
  lives: number;
  waveNumber: number;
  onStartWave: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({ money, lives, waveNumber, onStartWave }) => {
  return (
    <div className="game-ui">
      <div>Money: {money}</div>
      <div>Lives: {lives}</div>
      <div>Wave: {waveNumber}</div>
      <button onClick={onStartWave}>Start Wave</button>
    </div>
  );
};
