import { useEffect, useRef } from 'react';

interface WaveVisualizerProps {
  isActive: boolean;
  color?: string;
  height?: number;
}

export function WaveVisualizer({ isActive, color = '#7C3AED', height = 40 }: WaveVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const barCount = 32;
    const barWidth = canvas.offsetWidth / barCount / 2;
    const bars = Array.from({ length: barCount }, () => Math.random() * 0.3);

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.offsetWidth, height);

      for (let i = 0; i < barCount; i++) {
        if (isActive) {
          bars[i] += (Math.random() - 0.5) * 0.15;
          bars[i] = Math.max(0.05, Math.min(1, bars[i]));
        } else {
          bars[i] *= 0.92;
        }

        const barHeight = bars[i] * (height - 4);
        const x = (i / barCount) * canvas.offsetWidth;
        const y = (height - barHeight) / 2;

        ctx.fillStyle = color;
        ctx.globalAlpha = 0.4 + bars[i] * 0.6;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animationRef.current);
  }, [isActive, color, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height }}
      className="rounded-lg"
    />
  );
}
