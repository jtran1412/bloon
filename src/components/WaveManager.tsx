// src/components/WaveManager.tsx
import React from 'react';

interface WaveManagerProps {
  waveNumber: number;
  onStartWave: () => void;
}

export const WaveManager: React.FC<WaveManagerProps> = ({ waveNumber, onStartWave }) => {
  return (
    <div className="wave-manager">
      <div>Current Wave: {waveNumber}</div>
      <button onClick={onStartWave}>Start Next Wave</button>
    </div>
  );
};
