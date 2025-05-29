import React from 'react';
import styled from 'styled-components';

interface VictoryScreenProps {
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

const Message = styled.p`
  font-size: 24px;
  margin: 0;
  text-align: center;
`;

const RestartButton = styled.button`
  background: #4CAF50;
  border: none;
  color: white;
  padding: 12px 24px;
  font-size: 18px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #45a049;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const VictoryScreen: React.FC<VictoryScreenProps> = ({ onRestart }) => {
  return (
    <Overlay>
      <Title>Victory!</Title>
      <Message>
        Congratulations!<br />
        You've completed all waves!
      </Message>
      <RestartButton onClick={onRestart}>Play Again</RestartButton>
    </Overlay>
  );
};

export default VictoryScreen; 