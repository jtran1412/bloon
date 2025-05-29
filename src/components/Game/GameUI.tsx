import React from 'react';
import styled from 'styled-components';
import moneySign from '../../assets/images/moneySign.png';
import hearts from '../../assets/images/hearts.png';
import plankBlank from '../../assets/images/plankBlank.png';

interface GameUIProps {
  health: number;
  money: number;
  wave: number;
  isSpawning: boolean;
  onStartWave: () => void;
  canStartWave: boolean;
  isSpeedUp: boolean;
  onToggleSpeed: () => void;
  selectedTower: { type: string; cost: number } | null;
  onSellTower: () => void;
}

const UIContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const StatsGroup = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const StatContainer = styled.div`
  display: flex;
  align-items: center;
  background: url(${plankBlank}) no-repeat center center;
  background-size: 100% 100%;
  padding: 8px 16px;
  min-width: 100px;
  height: 40px;
  margin-right: -1px;
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const StatIcon = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 6px;
`;

const StatText = styled.span`
  color: white;
  font-size: 16px;
  font-weight: bold;
  text-shadow: 1px 1px 2px black;
`;

const ButtonBase = styled.button`
  position: relative;
  background: url(${plankBlank}) no-repeat center center;
  background-size: 100% 100%;
  border: none;
  padding: 0;
  color: white;
  font-size: 14px;
  font-weight: bold;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: -1px;

  &:hover:not(:disabled) {
    transform: scale(1.05);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }
`;

const WaveButton = styled(ButtonBase)<{ isSpawning: boolean }>`
  cursor: ${props => props.isSpawning ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.isSpawning ? 0.7 : 1};
  flex: 2;
`;

const FastForwardButton = styled(ButtonBase)`
  flex: 1;
`;

const SellButton = styled(ButtonBase)`
  flex: 1;
  color: #FF4444;
  font-weight: bold;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SellPrice = styled.span`
  color: #98FF98;
  margin-left: 4px;
`;

const GameUI: React.FC<GameUIProps> = ({
  health,
  money,
  wave,
  isSpawning,
  onStartWave,
  canStartWave,
  isSpeedUp,
  onToggleSpeed,
  selectedTower,
  onSellTower
}) => {
  const sellPrice = selectedTower ? Math.floor(selectedTower.cost * 0.8) : 0;

  return (
    <UIContainer>
      <StatsGroup>
        <StatContainer>
          <StatIcon src={hearts} alt="Health" />
          <StatText>{health}</StatText>
        </StatContainer>
        <StatContainer>
          <StatIcon src={moneySign} alt="Money" />
          <StatText>${money}</StatText>
        </StatContainer>
        <StatContainer style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}>
          <StatText>Wave {wave}</StatText>
        </StatContainer>
        <WaveButton
          onClick={onStartWave}
          disabled={!canStartWave}
          isSpawning={isSpawning}
          title={!canStartWave && isSpawning ? "Wave in progress" : !canStartWave ? "Clear all enemies first" : "Start Wave"}
          style={{ borderRadius: 0 }}
        >
          {isSpawning ? 'Wave in Progress' : 'Start Wave'}
        </WaveButton>
        <FastForwardButton
          onClick={onToggleSpeed}
          title="Press 'F' to toggle fast forward"
          style={{ borderRadius: 0 }}
        >
          {isSpeedUp ? '⏩ 100x' : '⏩ 10x'}
        </FastForwardButton>
        <SellButton
          onClick={onSellTower}
          disabled={!selectedTower}
          title={selectedTower ? "Press Delete or Backspace to sell" : "Select a tower to sell"}
          style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
        >
          Sell{selectedTower && <SellPrice>${sellPrice}</SellPrice>}
        </SellButton>
      </StatsGroup>
    </UIContainer>
  );
};

export default GameUI; 