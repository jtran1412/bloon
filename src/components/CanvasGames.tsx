import React, { useRef, useEffect } from 'react';

export const CanvasGames: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initial draw: background fill
    ctx.fillStyle = '#e0f7fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Initial draw: simple path line
    ctx.strokeStyle = '#424242';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(100, 100);
    ctx.lineTo(500, 300);
    ctx.stroke();

    // Game loop setup
    let animationFrameId: number;

    const gameLoop = () => {
      // TODO: update and draw game objects here

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    // Cleanup on unmount
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return <canvas ref={canvasRef} style={{ display: 'block' }} />;
};
