import { useRef, useEffect } from 'react';

interface ConfidenceCurveProps {
  data: number[]; // array of confidence scores per response
  height?: number;
}

export function ConfidenceCurve({ data, height = 160 }: ConfidenceCurveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = 2;
    const w = canvas.offsetWidth;
    canvas.width = w * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const padding = { top: 20, bottom: 25, left: 30, right: 10 };
    const chartW = w - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Grid lines
    ctx.strokeStyle = 'rgba(124,58,237,0.08)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 10; i += 2) {
      const y = padding.top + chartH - (i / 10) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      ctx.fillStyle = '#4A4966';
      ctx.font = '10px Inter';
      ctx.textAlign = 'right';
      ctx.fillText(i.toString(), padding.left - 6, y + 3);
    }

    if (data.length < 2) return;

    // Draw line
    const stepX = chartW / (data.length - 1);
    const points = data.map((v, i) => ({
      x: padding.left + i * stepX,
      y: padding.top + chartH - (v / 10) * chartH,
    }));

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(124,58,237,0.2)');
    gradient.addColorStop(1, 'rgba(124,58,237,0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding.bottom);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      ctx.bezierCurveTo(cpx, prev.y, cpx, curr.y, curr.x, curr.y);
    }
    ctx.strokeStyle = '#7C3AED';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dots
    points.forEach((p, i) => {
      const color = data[i] >= 7 ? '#14B8A6' : data[i] >= 4 ? '#F59E0B' : '#F43F5E';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#0D0D14';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [data, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height }}
      className="rounded-xl"
    />
  );
}
