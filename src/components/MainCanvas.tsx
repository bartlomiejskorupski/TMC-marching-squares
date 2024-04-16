import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useEffect, useRef } from 'react';

const SQUARE_SIZE = 50;
const RASTER_OFF = {
  X: 60,
  Y: 30,
};
const TEXT_SIZE = '1rem';
const DOTS_RADIUS = 4;

export default function MainCanvas() {
  const { contour, raster, contourValue } = useSelector(
    (state: RootState) => state.canvas
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!ctx) {
      return;
    }

    ctx.reset();

    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 600, 600);

    // Draw raster
    ctx.font = `${TEXT_SIZE} system-ui`;
    for (let y = 0; y < raster.length; y++) {
      const row = raster[y];
      for (let x = 0; x < row.length; x++) {
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(
          x * SQUARE_SIZE + RASTER_OFF.X,
          y * SQUARE_SIZE + RASTER_OFF.Y,
          DOTS_RADIUS,
          0,
          2 * Math.PI
        );
        if (row[x] >= contourValue) {
          ctx.fill();
        } else {
          ctx.stroke();
        }
        ctx.fillStyle = '#707070';
        const cellValueFormatted = +row[x].toFixed(1);
        ctx.fillText(
          cellValueFormatted + '',
          x * SQUARE_SIZE + RASTER_OFF.X + 6,
          y * SQUARE_SIZE + RASTER_OFF.Y
        );
      }
    }

    // Draw contour
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    for (const line of contour) {
      const [p1, p2] = line.points;
      ctx.moveTo(
        p1.x * SQUARE_SIZE + RASTER_OFF.X,
        p1.y * SQUARE_SIZE + RASTER_OFF.Y
      );
      ctx.lineTo(
        p2.x * SQUARE_SIZE + RASTER_OFF.X,
        p2.y * SQUARE_SIZE + RASTER_OFF.Y
      );
    }
    ctx.stroke();
  }, [contour, raster, contourValue]);

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} width="600" height="500"></canvas>
    </div>
  );
}
