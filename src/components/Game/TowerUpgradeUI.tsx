import React from 'react';
import styled from 'styled-components';
import { Tower } from '../../types/game';
import plankBlank from '../../assets/images/plankBlank.png';

interface TowerUpgradeUIProps {
  tower: Tower;
  towerInfo: any; // Using any for now, should be properly typed
  playerMoney: number;
  onUpgrade: (tower: Tower, path: 1 | 2, cost: number) => void;
  onClose: () => void;
}

const UpgradeContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  padding: 15px;
  border-radius: 8px;
  color: white;
  min-width: 200px;
  z-index: 100;
`;

const UpgradePath = styled.div`
  margin-bottom: 15px;
`;

const PathTitle = styled.h3`
  margin: 0 0 10px 0;
  color: #98FF98;
  font-size: 16px;
`;

const UpgradeButton = styled.button<{ isDisabled: boolean }>`
  background: url(${plankBlank}) no-repeat center center;
  background-size: 100% 100%;
  border: none;
  padding: 8px 16px;
  width: 100%;
  color: ${props => props.isDisabled ? '#666' : 'white'};
  font-weight: bold;
  cursor: ${props => props.isDisabled ? 'not-allowed' : 'pointer'};
  margin-bottom: 5px;
  opacity: ${props => props.isDisabled ? 0.7 : 1};
  transition: transform 0.1s;

  &:hover:not(:disabled) {
    transform: scale(1.05);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }
`;

const Cost = styled.span`
  color: #98FF98;
  margin-left: 8px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 5px;
  line-height: 1;

  &:hover {
    color: #ff4444;
  }
`;

const Condition = styled.div<{ isMet: boolean }>`
  font-size: 12px;
  color: ${props => props.isMet ? '#98FF98' : '#ff4444'};
  margin-top: 4px;
`;

const TowerUpgradeUI: React.FC<TowerUpgradeUIProps> = ({
  tower,
  towerInfo,
  playerMoney,
  onUpgrade,
  onClose
}) => {
  const renderUpgradePath = (path: 1 | 2) => {
    const upgrades = path === 1 ? towerInfo.upgrades?.path1 : towerInfo.upgrades?.path2;
    const currentLevel = path === 1 ? tower.upgrades.path1 : tower.upgrades.path2;
    const otherPathLevel = path === 1 ? tower.upgrades.path2 : tower.upgrades.path1;

    // Don't show anything if we've maxed out upgrades
    if (!upgrades || currentLevel >= upgrades.length) return null;

    // Only show the next upgrade in sequence
    const nextUpgradeIndex = currentLevel;
    if (nextUpgradeIndex >= upgrades.length) return null;

    const nextUpgrade = upgrades[nextUpgradeIndex];
    const canAfford = playerMoney >= nextUpgrade.cost;
    const otherPathEmpty = otherPathLevel === 0;
    
    const conditions = [
      { text: "Can afford upgrade", met: canAfford },
      { text: "Other path must be empty", met: otherPathEmpty },
      { text: `Next upgrade available (${currentLevel} → ${currentLevel + 1})`, met: true }
    ];

    // Show all upgrades but highlight current one
    const upgradeList = upgrades.map((upgrade: { name: string }, index: number) => (
      <div key={index} style={{ 
        opacity: index === nextUpgradeIndex ? 1 : 0.5,
        marginBottom: '4px'
      }}>
        {index === nextUpgradeIndex ? '▶ ' : '  '}Level {index + 1}: {upgrade.name}
        {index < currentLevel && ' ✓'}
      </div>
    ));

    return (
      <UpgradePath>
        <PathTitle>Path {path} - Level {currentLevel}</PathTitle>
        {upgradeList}
        <UpgradeButton
          isDisabled={!canAfford || !otherPathEmpty}
          onClick={() => onUpgrade(tower, path, nextUpgrade.cost)}
          disabled={!canAfford || !otherPathEmpty}
          title={
            !canAfford ? "Not enough money" :
            !otherPathEmpty ? "Can't upgrade both paths" :
            nextUpgrade.description
          }
        >
          Buy Next Upgrade
          <Cost>${nextUpgrade.cost}</Cost>
        </UpgradeButton>
        {conditions.map((condition, index) => (
          <Condition key={index} isMet={condition.met}>
            • {condition.text}: {condition.met ? "✓" : "✗"}
          </Condition>
        ))}
      </UpgradePath>
    );
  };

  return (
    <UpgradeContainer>
      <CloseButton onClick={onClose}>&times;</CloseButton>
      {renderUpgradePath(1)}
      {renderUpgradePath(2)}
    </UpgradeContainer>
  );
};

export default TowerUpgradeUI; 