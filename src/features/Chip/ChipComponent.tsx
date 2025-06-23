import './chip.sass';
import { useDrag } from "react-dnd";
import { DRAG_TYPES } from "@/entities/constants";
import Chip from "@/entities/chip/Chip";
import ChipImage from '@/assets/images/chip-image.png';
import { useEffect, useRef } from "react";

type Props = {
  chip: Chip | null;
};

const size = 50;
const borderWidth = 0;
const borderColor = 'transparent';

export default function ChipComponent(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Создаем кастомное изображение для drag preview
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);

    if (borderWidth > 0) {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - borderWidth / 2, 0, Math.PI * 2);
      ctx.lineWidth = borderWidth;
      ctx.strokeStyle = borderColor;
      ctx.stroke();
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = ChipImage;

    img.onload = () => {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - borderWidth, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      const ratio = Math.min(size / img.width, size / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;
      const x = (size - newWidth) / 2;
      const y = (size - newHeight) / 2;

      ctx.drawImage(img, x, y, newWidth, newHeight);
    };
  }, []);

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: DRAG_TYPES.CHIP,
    item: props.chip,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Используем сам canvas в качестве drag preview
  useEffect(() => {
    if (canvasRef.current) {
      preview(canvasRef.current, {
        offsetX: size / 2,
        offsetY: size / 2,
      });
    }
  }, [preview]);

  if (!props.chip) {
    return null;
  }

  return (
    <div
      ref={drag}
      className='chip-item'
      style={{
        outline: 'none',
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'inline-block',
        opacity: isDragging ? 0.7 : 1, // Полупрозрачность при перетаскивании
        cursor: 'grab',
      }}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{
          display: 'block',
          outline: 'none',
        }}
      />
    </div>
  );
}