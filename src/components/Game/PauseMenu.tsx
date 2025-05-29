import React from 'react';
import styled from 'styled-components';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
}

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  color: white;
  z-index: 100;
`;

const Title = styled.h1`
  font-size: 48px;
  margin: 0;
  color: #FFD700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 200px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  background: ${props => {
    switch (props.variant) {
      case 'primary': return '#4CAF50';
      case 'secondary': return '#666';
      case 'danger': return '#FF4444';
      default: return '#4CAF50';
    }
  }};
  border: none;
  color: white;
  padding: 12px 24px;
  font-size: 18px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.05);
    filter: brightness(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const Controls = styled.div`
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  opacity: 0.8;
`;

const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart
}) => {
  return (
    <Overlay>
      <Title>Paused</Title>
      <ButtonsContainer>
        <Button variant="primary" onClick={onResume}>
          Resume Game
        </Button>
        <Button variant="danger" onClick={onRestart}>
          Restart Game
        </Button>
      </ButtonsContainer>
      <Controls>
        <h3>Controls</h3>
        <p>Space - Start Wave</p>
        <p>1-4 - Change Tower Targeting</p>
        <p>, / . - Upgrade Paths</p>
        <p>Delete - Sell Tower</p>
        <p>Esc - Pause Game</p>
      </Controls>
    </Overlay>
  );
};

export default PauseMenu; 