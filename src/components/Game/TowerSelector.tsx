import React from 'react';
import styled from 'styled-components';
import { TowerInfo } from '../../types/game';
import { getImage } from '../../game/imageLoader';

interface TowerSelectorProps {
  selectedTower: string | null;
  onSelectTower: (tower: string | null) => void;
  playerMoney: number;
  towerTypes: { [key: string]: TowerInfo };
}

const SidePanel = styled.div`
  width: 200px;
  height: calc(100% - 50px); // Subtract navbar height
  background: rgba(0, 0, 0, 0.3);
  padding: 10px;
  overflow-y: auto;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  
  /* Custom scrollbar styles */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.4);
  }
`;

const TowerButton = styled.button<{ isSelected: boolean; canAfford: boolean }>`
  background: ${props => props.isSelected ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.5)'};
  border: 2px solid ${props => props.isSelected ? '#FFD700' : props.canAfford ? '#4CAF50' : '#FF6B6B'};
  border-radius: 8px;
  padding: 8px;
  color: white;
  cursor: ${props => props.canAfford ? 'grab' : 'not-allowed'};
  opacity: ${props => props.canAfford ? 1 : 0.6};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
  width: 100%;
  margin-bottom: 8px;

  &:hover:not(:disabled) {
    transform: scale(1.05);
  }

  &:active:not(:disabled) {
    cursor: grabbing;
    transform: scale(0.95);
  }
`;

const TowerIcon = styled.div<{ hasImage: boolean }>`
  width: 40px;
  height: 40px;
  background: ${props => props.hasImage ? 'transparent' : '#666'};
  border-radius: 4px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const TowerName = styled.span`
  font-size: 12px;
  font-weight: bold;
`;

const TowerCost = styled.span<{ canAfford: boolean }>`
  font-size: 11px;
  color: ${props => props.canAfford ? '#98FF98' : '#FF6B6B'};
`;

const TowerSelector: React.FC<TowerSelectorProps> = ({
  selectedTower,
  onSelectTower,
  playerMoney,
  towerTypes,
}) => {
  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, towerType: string) => {
    e.dataTransfer.setData('tower', towerType);
    e.dataTransfer.effectAllowed = 'move';

    // Create drag image
    const towerImage = getImage(`/src/assets/towers/${towerType.toLowerCase().replace(/ /g, '_')}.png`);
    if (towerImage) {
      const canvas = document.createElement('canvas');
      canvas.width = 40;
      canvas.height = 40;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(towerImage, 0, 0, 40, 40);
        e.dataTransfer.setDragImage(canvas, 20, 20);
      }
    }
  };

  return (
    <SidePanel>
      {Object.entries(towerTypes).map(([type, info]) => {
        const canAfford = playerMoney >= info.cost;
        const towerImage = getImage(`/src/assets/towers/${type.toLowerCase().replace(/ /g, '_')}.png`);

        return (
          <TowerButton
            key={type}
            isSelected={selectedTower === type}
            canAfford={canAfford}
            onClick={() => onSelectTower(selectedTower === type ? null : type)}
            draggable={canAfford}
            onDragStart={(e) => handleDragStart(e, type)}
          >
            <TowerIcon hasImage={!!towerImage}>
              {towerImage && <img src={towerImage.src} alt={type} />}
            </TowerIcon>
            <TowerName>{type}</TowerName>
            <TowerCost canAfford={canAfford}>${info.cost}</TowerCost>
          </TowerButton>
        );
      })}
    </SidePanel>
  );
};

export default TowerSelector; 