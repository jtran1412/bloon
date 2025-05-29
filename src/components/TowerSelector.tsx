// src/components/TowerSelector.tsx
import React from 'react';

interface TowerSelectorProps {
  onSelectTower: (type: string) => void;
}

export const TowerSelector: React.FC<TowerSelectorProps> = ({ onSelectTower }) => {
  return (
    <div className="tower-selector">
      <button onClick={() => onSelectTower('basic')}>Basic Tower</button>
      <button onClick={() => onSelectTower('sniper')}>Sniper Tower</button>
      {/* Add more tower types */}
    </div>
  );
};
