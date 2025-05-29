import React from 'react';
import styled from 'styled-components';

export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Impoppable';

interface DifficultySelectorProps {
  onSelectDifficulty: (difficulty: Difficulty) => void;
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

const DifficultyButton = styled.button<{ difficulty: Difficulty }>`
  background: ${props => {
    switch (props.difficulty) {
      case 'Easy': return '#4CAF50';
      case 'Medium': return '#FFA500';
      case 'Hard': return '#FF4444';
      case 'Impoppable': return '#800080';
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

const Description = styled.p`
  font-size: 14px;
  margin: 0;
  text-align: center;
  opacity: 0.8;
`;

const difficultyInfo: Record<Difficulty, { description: string }> = {
  Easy: {
    description: 'More starting money, slower bloons, lower prices'
  },
  Medium: {
    description: 'Standard game balance'
  },
  Hard: {
    description: 'Less money, faster bloons, higher prices'
  },
  Impoppable: {
    description: 'One life, extreme bloon speed, very high prices'
  }
};

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ onSelectDifficulty }) => {
  return (
    <Overlay>
      <Title>Select Difficulty</Title>
      <ButtonsContainer>
        {(Object.keys(difficultyInfo) as Difficulty[]).map(difficulty => (
          <div key={difficulty}>
            <DifficultyButton
              difficulty={difficulty}
              onClick={() => onSelectDifficulty(difficulty)}
            >
              {difficulty}
            </DifficultyButton>
            <Description>{difficultyInfo[difficulty].description}</Description>
          </div>
        ))}
      </ButtonsContainer>
    </Overlay>
  );
};

export default DifficultySelector; 