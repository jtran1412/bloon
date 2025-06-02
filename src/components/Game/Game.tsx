import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import { GameState, Enemy, Tower, Point, TowerInfo, Bullet } from '../../types/game';
import { monkeyLaneMap } from '../../game/maps';
import { TOWER_TYPES } from '../../types/game';
import { calculateDistance, createTower, moveEnemy, updateTower, createChildBloons, isValidTowerPlacement } from '../../game/mechanics';
import { WaveState, createWaveState, updateWaveState } from '../../game/wave';
import { preloadImages, getImage, createProjectileImage } from '../../game/imageLoader';
import AudioManager from '../../game/audioManager';
import TowerSelector from './TowerSelector';
import GameUI from './GameUI';
import { createBullet, updateBullet } from '../../game/projectiles';
import TowerUpgradeUI from './TowerUpgradeUI';
import { Particle, createHitParticle, createMoneyParticle, updateParticle, drawParticle } from '../../game/particles';
import GameOverScreen from './GameOverScreen';
import VictoryScreen from './VictoryScreen';
import DifficultySelector, { Difficulty } from './DifficultySelector';
import PauseMenu from './PauseMenu';
import plankBlank from '../../assets/images/plankBlank.png';

const GameContainer = styled.div`
  position: relative;
  width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 12px;
  overflow: hidden;
`;

const NavBar = styled.div`
  width: 100%;
  height: 50px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  background: rgba(0, 0, 0, 0.5);
`;

const GameStatsSection = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const GameContent = styled.div`
  display: flex;
  height: 500px;
`;

const GameArea = styled.div`
  position: relative;
  width: 700px;
  height: 500px;
`;

const TowerSelectorOverlay = styled.div`
  flex: 1;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
`;

const Canvas = styled.canvas`
  display: block;
  cursor: ${props => props.style?.cursor};
`;

const SCREEN_WIDTH = 700;
const SCREEN_HEIGHT = 500;
const SQUARE_SIZE = 50;
const FPS = 30;
const PATH_WIDTH = 40;

const COLORS = {
  red: '#FF0000',
  blue: '#0000FF',
  green: '#00FF00',
  yellow: '#FFFF00',
  pink: '#FFC0CB',
  black: '#000000',
  white: '#FFFFFF',
  zebra: '#CCCCCC',
  rainbow: '#FF00FF',
  ceramic: '#8B4513',
  moab: '#000080',
  bfb: '#800000',
  path: '#8B4513',
  grass: '#90EE90',
};

interface StartWaveButtonProps {
  isSpawning: boolean;
}

const StartWaveButton = styled.button<StartWaveButtonProps>`
  margin-top: 10px;
  padding: 8px 16px;
  background-color: ${({ isSpawning }: StartWaveButtonProps) => isSpawning ? '#666' : '#4CAF50'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: ${({ isSpawning }: StartWaveButtonProps) => isSpawning ? 'not-allowed' : 'pointer'};
  font-size: 1rem;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #45a049;
  }

  &:disabled {
    background-color: #666;
    cursor: not-allowed;
  }
`;

const PlacementMessage = styled.div<{ isValid: boolean }>`
  position: absolute;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  background: ${props => props.isValid ? 'rgba(0, 255, 0, 0.8)' : 'rgba(255, 0, 0, 0.8)'};
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  pointer-events: none;
  transition: opacity 0.2s;
  opacity: ${props => props.isValid ? 0 : 1};
`;

const SavePathButton = styled.button`
  position: absolute;
  bottom: 10px;
  left: 10px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
  z-index: 100;

  &:hover {
    background-color: #45a049;
  }
`;

const createInitialTower = (type: string, position: Point, info: TowerInfo): Tower => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    type,
    position,
    cost: info.cost,
    fireRate: info.fireRate,
    range: info.range,
    damage: info.damage,
    targetTimer: 0,
    angle: 0,
    targetingMode: 'First',
    upgrades: {
      path1: 0,
      path2: 0
    }
  };
};

const getDifficultyModifiers = (difficulty: Difficulty) => {
  switch (difficulty) {
    case 'Easy':
      return {
        startingMoney: 1000,
        startingHealth: 150,
        bloonSpeedMultiplier: 0.8,
        bloonHealthMultiplier: 0.8,
        towerCostMultiplier: 0.8,
        moneyMultiplier: 1.2
      };
    case 'Medium':
      return {
        startingMoney: 650,
        startingHealth: 100,
        bloonSpeedMultiplier: 1,
        bloonHealthMultiplier: 1,
        towerCostMultiplier: 1,
        moneyMultiplier: 1
      };
    case 'Hard':
      return {
        startingMoney: 400,
        startingHealth: 75,
        bloonSpeedMultiplier: 1.2,
        bloonHealthMultiplier: 1.2,
        towerCostMultiplier: 1.2,
        moneyMultiplier: 0.8
      };
    case 'Impoppable':
      return {
        startingMoney: 250,
        startingHealth: 1,
        bloonSpeedMultiplier: 1.5,
        bloonHealthMultiplier: 1.5,
        towerCostMultiplier: 1.5,
        moneyMultiplier: 0.5
      };
  }
};

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [selectedTower, setSelectedTower] = useState<string | null>(null);
  const [selectedTowerForUpgrade, setSelectedTowerForUpgrade] = useState<Tower | null>(null);
  const [waveState, setWaveState] = useState<WaveState>(createWaveState());
  const [gameState, setGameState] = useState<GameState>({
    player: {
      health: 100,
      money: 650,
    },
    enemies: [],
    towers: [],
    bullets: [],
    wave: 1,
    isPlaying: false,
  });
  const [dragPreview, setDragPreview] = useState<{
    position: Point;
    towerType: string;
    isValid: boolean;
  } | null>(null);
  const [placementValid, setPlacementValid] = useState(true);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const difficultyModifiers = difficulty ? getDifficultyModifiers(difficulty) : null;
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef<number | null>(null);
  const [waveCompleted, setWaveCompleted] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [lastClickTime, setLastClickTime] = useState<{index: number, time: number} | null>(null);
  const [isSpeedUp, setIsSpeedUp] = useState(false);
  const speedMultiplier = isSpeedUp ? 100 : 10;
  const [canPlace, setCanPlace] = useState(true);

  // Initialize audio manager
  useEffect(() => {
    const audio = AudioManager.getInstance();
    audio.startMusic();
    return () => audio.stopMusic();
  }, []);

  // Load images
  useEffect(() => {
    const loadGameAssets = async () => {
      await preloadImages();
      setImagesLoaded(true);
    };
    loadGameAssets();
  }, []);

  const handlePointClick = useCallback((pointIndex: number) => {
    const currentTime = Date.now();
    
    if (lastClickTime && 
        lastClickTime.index === pointIndex && 
        currentTime - lastClickTime.time < 300) {
      
      if (pointIndex !== 0 && pointIndex !== monkeyLaneMap.path.length - 1) {
        // Update the path in monkeyLaneMap directly
        monkeyLaneMap.path = monkeyLaneMap.path.filter((_, index) => index !== pointIndex);
        setLastClickTime(null);
      }
    } else {
      setLastClickTime({ index: pointIndex, time: currentTime });
    }
  }, [lastClickTime]);

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>, pointIndex: number) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check if click is near a point
    const point = monkeyLaneMap.path[pointIndex];
    const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
    
    if (distance < 10) { // 10px radius for click detection
      handlePointClick(pointIndex);
      
      // Only start dragging on single click
      if (!lastClickTime || Date.now() - lastClickTime.time >= 300) {
        setIsDragging('path-point');
        setSelectedPoint(pointIndex);
      }
    }
  }, [monkeyLaneMap.path, lastClickTime, handlePointClick]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging && selectedPoint !== null) {
      const canvas = event.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(700, event.clientX - rect.left));
      const y = Math.max(0, Math.min(500, event.clientY - rect.top));
      monkeyLaneMap.path[selectedPoint] = { x, y };
    }

    // Add tower placement preview logic
    if (selectedTower) {
      const canvas = event.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const position = { x, y };

      // Check if placement is valid
      const isOnPath = monkeyLaneMap.path.some((point, index) => {
        if (index === monkeyLaneMap.path.length - 1) return false;
        const nextPoint = monkeyLaneMap.path[index + 1];
        const distance = calculateDistance(
          position,
          { x: (point.x + nextPoint.x) / 2, y: (point.y + nextPoint.y) / 2 }
        );
        return distance < PATH_WIDTH;
      });

      const isValid = !isOnPath && isValidTowerPlacement(position, gameState.towers, monkeyLaneMap.path);
      setCanPlace(isValid);
    }
  }, [isDragging, selectedPoint, selectedTower, gameState.towers]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
    setSelectedPoint(null);

    // Log the new coordinates to console for easy copying
    if (selectedPoint !== null) {
      console.log('Updated path coordinates:');
      monkeyLaneMap.path.forEach((point: Point, index: number) => {
        console.log(`{ x: ${Math.round(point.x)}, y: ${Math.round(point.y)} },${index === monkeyLaneMap.path.length - 1 ? ' // Exit point' : ''}`);
      });
    }
  }, [selectedPoint, monkeyLaneMap.path]);

  const drawPath = useCallback((ctx: CanvasRenderingContext2D) => {
    // Draw background
    const backgroundImage = getImage('/src/assets/maps/monkey-lane.png');
    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    } else {
      ctx.fillStyle = '#90EE90';
      ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    }
    
    // Draw path lines
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
    ctx.lineWidth = 3;
    ctx.moveTo(monkeyLaneMap.path[0].x, monkeyLaneMap.path[0].y);
    
    for (let i = 1; i < monkeyLaneMap.path.length; i++) {
      ctx.lineTo(monkeyLaneMap.path[i].x, monkeyLaneMap.path[i].y);
    }
    ctx.stroke();

    // Draw waypoints
    monkeyLaneMap.path.forEach((point: Point, index: number) => {
      ctx.beginPath();
      ctx.fillStyle = index === selectedPoint ? 'yellow' : 
                     index === 0 ? 'green' : 
                     index === monkeyLaneMap.path.length - 1 ? 'red' : 'blue';
      
      // Make middle points larger and add white border for better visibility
      const radius = (index !== 0 && index !== monkeyLaneMap.path.length - 1) ? 8 : 5;
      
      // Draw white border
      ctx.beginPath();
      ctx.fillStyle = 'white';
      ctx.arc(point.x, point.y, radius + 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw point
      ctx.beginPath();
      ctx.fillStyle = index === selectedPoint ? 'yellow' : 
                     index === 0 ? 'green' : 
                     index === monkeyLaneMap.path.length - 1 ? 'red' : 'blue';
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw coordinate labels
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.fillText(`${index}:(${Math.round(point.x)},${Math.round(point.y)})`, point.x + 10, point.y);
    });
  }, [monkeyLaneMap.path, selectedPoint]);

  const drawTowers = useCallback((ctx: CanvasRenderingContext2D) => {
    gameState.towers.forEach((tower: Tower) => {
      const towerImage = getImage(`/src/assets/towers/${tower.type.toLowerCase()}.png`);
      if (towerImage) {
        const size = 40;
        ctx.drawImage(
          towerImage,
          tower.position.x - size / 2,
          tower.position.y - size / 2,
          size,
          size
        );
      } else {
        ctx.beginPath();
        ctx.fillStyle = '#000000';
        ctx.arc(tower.position.x, tower.position.y, 15, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw range circle
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.arc(tower.position.x, tower.position.y, tower.range, 0, Math.PI * 2);
      ctx.stroke();
    });
  }, [gameState.towers]);

  const drawEnemies = useCallback((ctx: CanvasRenderingContext2D) => {
    gameState.enemies.forEach(enemy => {
      const enemyImage = getImage('/src/assets/enemies/bloonImg.png');
      
      ctx.save();
      ctx.translate(enemy.position.x, enemy.position.y);
      ctx.rotate(enemy.angle);
      
      const size = enemy.isMoab ? 80 : 30;
      
      // Draw bloon base color
      ctx.beginPath();
      ctx.fillStyle = COLORS[enemy.type.toLowerCase() as keyof typeof COLORS] || COLORS.red;
      ctx.arc(0, 0, size/2, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw bloon image overlay
      if (enemyImage) {
        ctx.globalAlpha = 0.9;
        ctx.drawImage(enemyImage, -size/2, -size/2, size, size);
        ctx.globalAlpha = 1;
      }

      // Draw camo pattern if applicable
      if (enemy.isCamo) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        for (let i = -size/2; i < size/2; i += 8) {
          ctx.beginPath();
          ctx.moveTo(i, -size/2);
          ctx.lineTo(i + size, size/2);
          ctx.stroke();
        }
      }

      // Draw regrow symbol if applicable
      if (enemy.isRegrow) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, size/4, 0, Math.PI * 1.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(size/4, 0);
        ctx.lineTo(size/4 - 4, -4);
        ctx.lineTo(size/4 + 4, -4);
        ctx.closePath();
        ctx.stroke();
      }

      // Draw health bar for MOABs and Ceramics
      if (enemy.isMoab || enemy.type === 'Ceramic') {
        const healthPercent = enemy.health / enemy.layer;
        const barWidth = size * 0.8;
        const barHeight = 4;
        
        // Health bar background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(-barWidth/2, -size/2 - 10, barWidth, barHeight);
        
        // Health bar fill
        ctx.fillStyle = enemy.isMoab ? '#FF0000' : '#8B4513';
        ctx.fillRect(-barWidth/2, -size/2 - 10, barWidth * healthPercent, barHeight);
      }

      ctx.restore();
    });
  }, [gameState.enemies]);

  const drawBullets = useCallback((ctx: CanvasRenderingContext2D) => {
    gameState.bullets.forEach(bullet => {
      ctx.save();
      ctx.translate(bullet.position.x, bullet.position.y);
      ctx.rotate(bullet.angle);
      
      // Create or get cached projectile image
      const bulletCanvas = createProjectileImage(bullet.color, bullet.size);
      ctx.drawImage(bulletCanvas, -bullet.size, -bullet.size);

      // Draw splash radius if applicable
      if (bullet.splashRadius) {
        ctx.beginPath();
        ctx.strokeStyle = `${bullet.color}44`;
        ctx.arc(0, 0, bullet.splashRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    });
  }, [gameState.bullets]);

  const handleStartWave = useCallback(() => {
    if (!waveState.isSpawning && 
        gameState.enemies.length === 0 && 
        waveState.currentWave < monkeyLaneMap.waves.length) {
      AudioManager.getInstance().playSound('newTowerIntro');
      setWaveState(prev => ({
        ...prev,
        isSpawning: true,
        spawnTimer: 0,
        currentWave: prev.currentWave + 1
      }));
      setGameState(prev => {
        // Create deep copies of towers to ensure upgrades persist
        const preservedTowers = prev.towers.map(tower => ({
          ...tower,
          upgrades: { ...tower.upgrades }
        }));

        return {
          ...prev,
          wave: prev.wave + 1,
          isPlaying: true,
          towers: preservedTowers
        };
      });
      setWaveCompleted(false);
    }
  }, [waveState.isSpawning, waveState.currentWave, gameState.enemies.length]);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedTower) {
      // Check if we clicked on an existing tower
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const clickPoint: Point = { x, y };

      const clickedTower = gameState.towers.find(tower => {
        const distance = calculateDistance(tower.position, clickPoint);
        return distance < 20; // 20px click radius
      });

      if (clickedTower) {
        setSelectedTowerForUpgrade(clickedTower);
        return;
      }
    }

    if (!selectedTower) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const clickPoint: Point = { x, y };

    // Check if click is on path
    const isOnPath = monkeyLaneMap.path.some((point, index) => {
      if (index === monkeyLaneMap.path.length - 1) return false;
      const nextPoint = monkeyLaneMap.path[index + 1];
      const distance = calculateDistance(
        clickPoint,
        { x: (point.x + nextPoint.x) / 2, y: (point.y + nextPoint.y) / 2 }
      );
      return distance < PATH_WIDTH;
    });

    if (!isOnPath && TOWER_TYPES[selectedTower]) {
      const towerInfo = TOWER_TYPES[selectedTower];
      if (gameState.player.money >= towerInfo.cost) {
        // Check if the placement is valid
        if (isValidTowerPlacement(clickPoint, gameState.towers, monkeyLaneMap.path)) {
          AudioManager.getInstance().playSound('placeTower');
          const newTower = createInitialTower(selectedTower, clickPoint, towerInfo);
          setGameState(prev => ({
            ...prev,
            towers: [...prev.towers, newTower],
            player: {
              ...prev.player,
              money: prev.player.money - towerInfo.cost
            }
          }));
        }
      } else {
        AudioManager.getInstance().playSound('click');
      }
    }
  }, [selectedTower, gameState.player.money, gameState.towers]);

  const handleTowerClick = useCallback((tower: Tower) => {
    setSelectedTowerForUpgrade(tower);
  }, []);

  const handleSellTower = useCallback((tower: Tower) => {
    const sellPrice = Math.floor(tower.cost * 0.8); // 80% of original cost
    AudioManager.getInstance().playSound('sellTower');
    
    setGameState(prev => ({
      ...prev,
      towers: prev.towers.filter(t => t.id !== tower.id),
      player: {
        ...prev.player,
        money: prev.player.money + sellPrice
      }
    }));
    
    setSelectedTowerForUpgrade(null);
  }, []);

  const handleUpgradeTower = useCallback((tower: Tower, path: 1 | 2, cost: number) => {
    // Early return if not enough money
    if (gameState.player.money < cost) {
      return;
    }

    // Get the current tower from state to ensure we have latest data
    const currentTower = gameState.towers.find(t => t.id === tower.id);
    if (!currentTower) {
      console.log('Tower not found');
      return;
    }

    const towerInfo = TOWER_TYPES[tower.type];
    const upgrades = path === 1 ? towerInfo.upgrades?.path1 : towerInfo.upgrades?.path2;
    const currentLevel = path === 1 ? currentTower.upgrades.path1 : currentTower.upgrades.path2;
    const otherPathLevel = path === 1 ? currentTower.upgrades.path2 : currentTower.upgrades.path1;

    // Validation checks
    if (!upgrades || currentLevel >= upgrades.length) {
      console.log('Max level reached');
      return;
    }

    if (otherPathLevel > 0) {
      console.log('Cannot upgrade both paths');
      return;
    }

    // Get the next upgrade
    const nextUpgrade = upgrades[currentLevel];
    if (!nextUpgrade) {
      console.log('No upgrade available');
      return;
    }

    AudioManager.getInstance().playSound('buyUpgrade');

    // Update game state with new tower stats
    setGameState(prev => {
      const updatedTowers = prev.towers.map(t => {
        if (t.id === tower.id) {
          // Create new tower object with updated stats and incremented level
          return {
            ...t,
            ...nextUpgrade.effects,
            upgrades: {
              ...t.upgrades,
              [path === 1 ? 'path1' : 'path2']: currentLevel + 1
            }
          };
        }
        return t;
      });

      return {
        ...prev,
        towers: updatedTowers,
        player: {
          ...prev.player,
          money: prev.player.money - cost
        }
      };
    });
  }, [gameState.player.money, gameState.towers]);

  const handleSelectDifficulty = useCallback((selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    const modifiers = getDifficultyModifiers(selectedDifficulty);
    setGameState({
      player: {
        health: modifiers.startingHealth,
        money: modifiers.startingMoney,
      },
      enemies: [],
      towers: [],
      bullets: [],
      wave: 0,
      isPlaying: false,
    });
    setWaveState(createWaveState());
  }, []);

  const handleRestart = useCallback(() => {
    setDifficulty(null);
    setGameState({
      player: {
        health: 100,
        money: 650,
      },
      enemies: [],
      towers: [],
      bullets: [],
      wave: 1,
      isPlaying: false,
    });
    setWaveState(createWaveState());
    setShowGameOver(false);
    setShowVictory(false);
    setSelectedTower(null);
    setSelectedTowerForUpgrade(null);
    setParticles([]);
    setIsSpeedUp(false);
  }, []);

  const updateGameState = useCallback(() => {
    setGameState(prev => {
      // Update wave state and spawn new enemies with speed multiplier
      const { waveState: updatedWaveState, newEnemies } = updateWaveState(
        waveState,
        prev.enemies,
        (1 / 30) * speedMultiplier,
        monkeyLaneMap.waves
      );
      setWaveState(updatedWaveState);

      // Check for wave completion
      if (!updatedWaveState.isSpawning && prev.enemies.length === 0 && newEnemies.length === 0 && !waveCompleted) {
        if (prev.wave >= monkeyLaneMap.waves.length) {
          setShowVictory(true);
        } else {
          const waveReward = Math.floor(100 + prev.wave * 50);
          prev.player.money += waveReward;
          setParticles(prevParticles => [
            ...prevParticles,
            createMoneyParticle({ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 }, waveReward)
          ]);
          setWaveCompleted(true);
        }
      }

      // Update existing enemies using current pathPoints and speed multiplier
      const updatedEnemies = [...prev.enemies, ...newEnemies]
        .map(enemy => moveEnemy(enemy, monkeyLaneMap.path, (1 / 30) * speedMultiplier))
        .filter(enemy => {
          if (enemy.target >= monkeyLaneMap.path.length) {
            prev.player.health -= enemy.isMoab ? 10 : 1;
            return false;
          }
          return true;
        });

      // Check for game over immediately when health reaches 0
      if (prev.player.health <= 0) {
        setShowGameOver(true);
        // Stop the game loop
        if (gameLoopRef.current) {
          cancelAnimationFrame(gameLoopRef.current);
          gameLoopRef.current = null;
        }
        return {
          ...prev,
          player: {
            ...prev.player,
            health: 0
          },
          isPlaying: false
        };
      }

      // Rest of the update logic...
      const updatedBullets: Bullet[] = [];
      const poppedBloons: Enemy[] = [];
      const newParticles: Particle[] = [];
      
      prev.bullets.forEach(bullet => {
        const { bullet: updatedBullet, hasReachedTarget } = updateBullet(bullet, (1 / 30) * speedMultiplier);
        
        if (!hasReachedTarget) {
          updatedBullets.push(updatedBullet);
        } else if (bullet.splashRadius && bullet.splashRadius > 0) {
          // Handle splash damage
          updatedEnemies.forEach(enemy => {
            const distance = calculateDistance(bullet.position, enemy.position);
            if (distance <= bullet.splashRadius!) {
              enemy.health -= bullet.damage;
              newParticles.push(createHitParticle(enemy.position));
              if (enemy.health <= 0) {
                AudioManager.getInstance().playRandomPop();
                prev.player.money += enemy.cashPrize;
                newParticles.push(createMoneyParticle(enemy.position, enemy.cashPrize));
                poppedBloons.push(enemy);
              }
            }
          });
        }
      });

      // Update towers
      const newBullets: Bullet[] = [];
      const updatedTowers = prev.towers.map(tower => {
        const { tower: updatedTower, hitEnemy } = updateTower(tower, updatedEnemies, (1 / 30) * speedMultiplier);
        if (hitEnemy) {
          const bullet = createBullet(tower, hitEnemy);
          newBullets.push(bullet);
          
          const enemyIndex = updatedEnemies.findIndex(e => e.id === hitEnemy.id);
          if (enemyIndex !== -1) {
            if (bullet.effects) {
              updatedEnemies[enemyIndex].effects = {
                ...updatedEnemies[enemyIndex].effects,
                ...bullet.effects,
                duration: 3
              };
            }
            
            if (!bullet.splashRadius) {
              updatedEnemies[enemyIndex].health -= tower.damage;
              newParticles.push(createHitParticle(hitEnemy.position));
              if (updatedEnemies[enemyIndex].health <= 0) {
                AudioManager.getInstance().playRandomPop();
                prev.player.money += updatedEnemies[enemyIndex].cashPrize;
                newParticles.push(createMoneyParticle(hitEnemy.position, updatedEnemies[enemyIndex].cashPrize));
                poppedBloons.push(updatedEnemies[enemyIndex]);
              }
            }
          }
        }
        return updatedTower;
      });

      // Update particles
      setParticles(prev => [
        ...prev.map(p => updateParticle(p, 1/30)).filter((p): p is Particle => p !== null),
        ...newParticles
      ]);

      // Create child bloons from popped bloons
      const childBloons = poppedBloons.flatMap(enemy => createChildBloons(enemy));

      return {
        ...prev,
        enemies: [...updatedEnemies.filter(enemy => !poppedBloons.includes(enemy)), ...childBloons],
        towers: updatedTowers,
        bullets: [...updatedBullets, ...newBullets],
        player: {
          ...prev.player,
          health: Math.max(0, prev.player.health)
        }
      };
    });
  }, [waveState, waveCompleted, monkeyLaneMap.path, speedMultiplier]);

  const drawGame = useCallback((ctx: CanvasRenderingContext2D) => {
    // Draw background and path
    drawPath(ctx);

    // Draw drag preview
    if (dragPreview && TOWER_TYPES[dragPreview.towerType]) {
      const towerInfo = TOWER_TYPES[dragPreview.towerType];
      
      // Draw range preview
      ctx.beginPath();
      ctx.strokeStyle = placementValid ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 0, 0, 0.3)';
      ctx.fillStyle = placementValid ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 0, 0, 0.1)';
      ctx.arc(dragPreview.position.x, dragPreview.position.y, towerInfo.range, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw tower preview
      ctx.globalAlpha = 0.6;
      const towerImage = getImage(`/src/assets/towers/${dragPreview.towerType.toLowerCase().replace(/ /g, '_')}.png`);
      if (towerImage) {
        const size = 40;
        ctx.drawImage(
          towerImage,
          dragPreview.position.x - size / 2,
          dragPreview.position.y - size / 2,
          size,
          size
        );
      } else {
        ctx.beginPath();
        ctx.fillStyle = placementValid ? '#000000' : '#FF0000';
        ctx.arc(dragPreview.position.x, dragPreview.position.y, 15, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Draw game elements
    drawTowers(ctx);
    drawEnemies(ctx);
    drawBullets(ctx);

    // Draw particles
    particles.forEach(particle => drawParticle(ctx, particle));
  }, [drawPath, drawTowers, drawEnemies, drawBullets, dragPreview, placementValid, particles]);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // Add pause to keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [togglePause]);

  // Update game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      if (!isPaused) {
        updateGameState();
      }
      drawGame(ctx);
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [updateGameState, drawGame, isPaused]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const position = { x, y };
    const towerType = event.dataTransfer.getData('tower');

    if (towerType && TOWER_TYPES[towerType]) {
      setDragPreview({
        position,
        towerType,
        isValid: isValidTowerPlacement(position, gameState.towers, monkeyLaneMap.path)
      });
      setPlacementValid(isValidTowerPlacement(position, gameState.towers, monkeyLaneMap.path));
    }
  }, [gameState.towers]);

  const handleDragLeave = useCallback(() => {
    setDragPreview(null);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    setDragPreview(null);
    const towerType = event.dataTransfer.getData('tower');
    if (!towerType || !TOWER_TYPES[towerType]) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const dropPoint: Point = { x, y };

    if (isValidTowerPlacement(dropPoint, gameState.towers, monkeyLaneMap.path)) {
      const towerInfo = TOWER_TYPES[towerType];
      if (gameState.player.money >= towerInfo.cost) {
        AudioManager.getInstance().playSound('placeTower');
        const newTower = createInitialTower(towerType, dropPoint, towerInfo);
        setGameState(prev => ({
          ...prev,
          towers: [...prev.towers, newTower],
          player: {
            ...prev.player,
            money: prev.player.money - towerInfo.cost
          }
        }));
      } else {
        AudioManager.getInstance().playSound('click');
      }
    }
  }, [gameState.player.money, gameState.towers]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Tower selection hotkeys
      const towerHotkeys: { [key: string]: string } = {
        'd': 'Dart Monkey',
        't': 'Tack Shooter',
        's': 'Sniper Monkey',
        'b': 'Boomerang Thrower',
        'n': 'Ninja Monkey',
        'c': 'Bomb Tower',
        'i': 'Ice Tower',
        'g': 'Glue Gunner',
        'w': 'Monkey Buccaneer',
        'x': 'Super Monkey',
        'm': 'Monkey Apprentice',
        'f': 'Spike Factory'
      };

      // Tower selection
      if (towerHotkeys[event.key.toLowerCase()]) {
        const towerType = towerHotkeys[event.key.toLowerCase()];
        setSelectedTower(selectedTower === towerType ? null : towerType);
      }

      // Upgrade hotkeys
      if (selectedTowerForUpgrade) {
        const towerInfo = TOWER_TYPES[selectedTowerForUpgrade.type];
        
        // Path 1 upgrade (comma key)
        if (event.key === ',') {
          const currentLevel = selectedTowerForUpgrade.upgrades.path1;
          const upgrades = towerInfo.upgrades?.path1;
          if (upgrades && currentLevel < upgrades.length) {
            const upgrade = upgrades[currentLevel];
            if (gameState.player.money >= upgrade.cost) {
              handleUpgradeTower(selectedTowerForUpgrade, 1, upgrade.cost);
            }
          }
        }
        
        // Path 2 upgrade (period key)
        if (event.key === '.') {
          const currentLevel = selectedTowerForUpgrade.upgrades.path2;
          const upgrades = towerInfo.upgrades?.path2;
          if (upgrades && currentLevel < upgrades.length) {
            const upgrade = upgrades[currentLevel];
            if (gameState.player.money >= upgrade.cost) {
              handleUpgradeTower(selectedTowerForUpgrade, 2, upgrade.cost);
            }
          }
        }

        // Sell tower (Delete or Backspace)
        if (event.key === 'Delete' || event.key === 'Backspace') {
          handleSellTower(selectedTowerForUpgrade);
        }
      }

      // Start wave (Space)
      if (event.code === 'Space' && !waveState.isSpawning && gameState.enemies.length === 0) {
        event.preventDefault();
        handleStartWave();
      } else if (event.code === 'KeyF') {
        setIsSpeedUp(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    selectedTower,
    selectedTowerForUpgrade,
    gameState.player.money,
    waveState.isSpawning,
    handleUpgradeTower,
    handleSellTower,
    handleStartWave
  ]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update preview position when selecting a new tower
      if (selectedTower) {
        const position = { x, y };
        const isValid = isValidTowerPlacement(position, gameState.towers, monkeyLaneMap.path);
        setDragPreview({
          position,
          towerType: selectedTower,
          isValid
        });
      }

      // Update tower position when dragging existing tower
      if (isDragging) {
        const updatedTowers = gameState.towers.map(tower => {
          if (tower.id === isDragging) {
            const newPosition = { x, y };
            if (isValidTowerPlacement(newPosition, gameState.towers.filter(t => t.id !== tower.id), monkeyLaneMap.path)) {
              return { ...tower, position: newPosition };
            }
          }
          return tower;
        });
        setGameState(prev => ({ ...prev, towers: updatedTowers }));
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [selectedTower, isDragging, gameState.towers]);

  // Update tower dragging handler
  const handleTowerMouseDown = (towerId: string) => {
    if (!gameState.isPlaying) {
      setIsDragging(towerId);
    }
  };

  // Add save path function
  const handleSavePath = useCallback(() => {
    try {
      localStorage.setItem('monkeyLanePath', JSON.stringify(monkeyLaneMap.path));
      alert('Path saved successfully!');
    } catch (error) {
      console.error('Failed to save path:', error);
      alert('Failed to save path. Please try again.');
    }
  }, []);

  return (
    <GameContainer>
      <NavBar>
        <GameStatsSection>
          <GameUI
            health={gameState.player.health}
            money={gameState.player.money}
            wave={gameState.wave}
            isSpawning={waveState.isSpawning}
            onStartWave={handleStartWave}
            canStartWave={!waveState.isSpawning && gameState.enemies.length === 0}
            isSpeedUp={isSpeedUp}
            onToggleSpeed={() => setIsSpeedUp(prev => !prev)}
            selectedTower={selectedTowerForUpgrade ? { 
              type: selectedTowerForUpgrade.type, 
              cost: selectedTowerForUpgrade.cost 
            } : null}
            onSellTower={() => selectedTowerForUpgrade && handleSellTower(selectedTowerForUpgrade)}
          />
        </GameStatsSection>
      </NavBar>
      <GameContent>
        <GameArea>
          <Canvas
            ref={canvasRef}
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            onMouseDown={(e) => {
              monkeyLaneMap.path.forEach((_: Point, index: number) => handleMouseDown(e, index));
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleCanvasClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ 
              cursor: selectedTower 
                ? canPlace 
                  ? 'pointer' 
                  : 'not-allowed'
                : 'default'
            }}
          />
          {!gameState.isPlaying && (
            <SavePathButton onClick={handleSavePath}>
              Save Path
            </SavePathButton>
          )}
          {selectedTowerForUpgrade && (
            <TowerUpgradeUI
              tower={selectedTowerForUpgrade}
              towerInfo={TOWER_TYPES[selectedTowerForUpgrade.type]}
              playerMoney={gameState.player.money}
              onUpgrade={handleUpgradeTower}
              onClose={() => setSelectedTowerForUpgrade(null)}
            />
          )}
          {dragPreview && (
            <PlacementMessage isValid={placementValid}>
              {placementValid ? 'Valid Placement' : 'Invalid Placement - Too close to path or other towers'}
            </PlacementMessage>
          )}
          {!imagesLoaded && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '20px',
              borderRadius: '10px'
            }}>
              Loading game assets...
            </div>
          )}
          {showGameOver && <GameOverScreen wave={gameState.wave} onRestart={handleRestart} />}
          {showVictory && <VictoryScreen onRestart={handleRestart} />}
          {isPaused && (
            <PauseMenu
              onResume={togglePause}
              onRestart={handleRestart}
            />
          )}
        </GameArea>
        <TowerSelectorOverlay>
          <TowerSelector
            selectedTower={selectedTower}
            onSelectTower={setSelectedTower}
            playerMoney={gameState.player.money}
            towerTypes={TOWER_TYPES}
          />
        </TowerSelectorOverlay>
      </GameContent>
    </GameContainer>
  );
};

export default Game; 