
import React, { useEffect, useRef } from 'react';
import { SafetyIssue, Severity } from '../types';

interface ImageVisualizerProps {
  imageUrl: string;
  issues: SafetyIssue[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

export const ImageVisualizer: React.FC<ImageVisualizerProps> = ({ imageUrl, issues, selectedIndex, onSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const container = containerRef.current;
      if (!container) return;

      // Scale canvas to fit container while maintaining aspect ratio
      const maxWidth = container.clientWidth;
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw bounding boxes
      issues.forEach((issue, index) => {
        const [ymin, xmin, ymax, xmax] = issue.box_2d;
        const x = (xmin / 1000) * canvas.width;
        const y = (ymin / 1000) * canvas.height;
        const w = ((xmax - xmin) / 1000) * canvas.width;
        const h = ((ymax - ymin) / 1000) * canvas.height;

        const isSelected = selectedIndex === index;
        
        // Severity colors
        const colors = {
          [Severity.HIGH]: '#ef4444',
          [Severity.MEDIUM]: '#f97316',
          [Severity.LOW]: '#eab308'
        };
        const color = colors[issue.severity];

        // Highlight box
        ctx.strokeStyle = color;
        ctx.lineWidth = isSelected ? 4 : 2;
        ctx.setLineDash(isSelected ? [] : [5, 5]);
        ctx.strokeRect(x, y, w, h);

        if (isSelected) {
            ctx.fillStyle = `${color}22`;
            ctx.fillRect(x, y, w, h);
        }

        // Label
        ctx.fillStyle = color;
        ctx.font = 'bold 12px Inter';
        const label = `#${index + 1} ${issue.issue_name}`;
        const labelWidth = ctx.measureText(label).width;
        ctx.fillRect(x, y - 20, labelWidth + 10, 20);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, x + 5, y - 6);
      });
    };
  }, [imageUrl, issues, selectedIndex]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / canvas.width) * 1000;
    const clickY = ((e.clientY - rect.top) / canvas.height) * 1000;

    // Find if click is within any box
    const foundIndex = issues.findIndex(issue => {
        const [ymin, xmin, ymax, xmax] = issue.box_2d;
        return clickX >= xmin && clickX <= xmax && clickY >= ymin && clickY <= ymax;
    });

    if (foundIndex !== -1) {
        onSelect(foundIndex);
    }
  };

  return (
    <div ref={containerRef} className="w-full relative rounded-xl overflow-hidden shadow-xl bg-slate-100 border border-slate-200">
      <canvas 
        ref={canvasRef} 
        onClick={handleCanvasClick}
        className="w-full h-auto cursor-crosshair"
      />
      {issues.length > 0 && (
          <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-lg border border-white/20 shadow-lg text-sm text-slate-700 font-medium">
             Nhấp vào các ô khoanh vùng để xem chi tiết vi phạm.
          </div>
      )}
    </div>
  );
};
