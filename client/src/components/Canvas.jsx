import React, { useRef, useEffect, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { COLORS, BRUSH_SIZES } from '../utils/constants';
import './Canvas.css';

const Canvas = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [currentSize, setCurrentSize] = useState(BRUSH_SIZES[2]);
  const [tool, setTool] = useState('pen'); // pen or eraser
  const { isCurrentDrawer, sendDrawData, clearCanvas, drawingData } = useGame();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = containerRef.current;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  // Redraw canvas when drawing data changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawingData.forEach((data) => {
      if (data.type === 'draw') {
        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.size;
        ctx.beginPath();
        ctx.moveTo(data.x0, data.y0);
        ctx.lineTo(data.x1, data.y1);
        ctx.stroke();
      }
    });
  }, [drawingData]);

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    if (!isCurrentDrawer) return;
    e.preventDefault();
    setIsDrawing(true);
    const pos = getMousePos(e);
    canvasRef.current.lastX = pos.x;
    canvasRef.current.lastY = pos.y;
  };

  const draw = (e) => {
    if (!isDrawing || !isCurrentDrawer) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getMousePos(e);

    const color = tool === 'eraser' ? '#FFFFFF' : currentColor;

    ctx.strokeStyle = color;
    ctx.lineWidth = tool === 'eraser' ? currentSize * 2 : currentSize;
    ctx.beginPath();
    ctx.moveTo(canvas.lastX, canvas.lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    const drawData = {
      type: 'draw',
      x0: canvas.lastX,
      y0: canvas.lastY,
      x1: pos.x,
      y1: pos.y,
      color,
      size: ctx.lineWidth,
    };

    sendDrawData(drawData);

    canvas.lastX = pos.x;
    canvas.lastY = pos.y;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClearCanvas = () => {
    if (!isCurrentDrawer) return;
    clearCanvas();
  };

  return (
    <div className="canvas-container">
      {isCurrentDrawer && (
        <div className="canvas-toolbar">
          <div className="tool-section">
            <span className="tool-label">Tool:</span>
            <button
              className={`tool-btn ${tool === 'pen' ? 'active' : ''}`}
              onClick={() => setTool('pen')}
              title="Pen"
            >
              ✏️
            </button>
            <button
              className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
              onClick={() => setTool('eraser')}
              title="Eraser"
            >
              🧹
            </button>
          </div>

          <div className="tool-section">
            <span className="tool-label">Size:</span>
            <div className="size-buttons">
              {BRUSH_SIZES.map((size) => (
                <button
                  key={size}
                  className={`size-btn ${currentSize === size ? 'active' : ''}`}
                  onClick={() => setCurrentSize(size)}
                  title={`Size ${size}`}
                >
                  <div
                    className="size-preview"
                    style={{
                      width: `${Math.min(size * 1.5, 20)}px`,
                      height: `${Math.min(size * 1.5, 20)}px`,
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="tool-section colors-section">
            <span className="tool-label">Color:</span>
            <div className="color-palette">
              {COLORS.map((color) => (
                <button
                  key={color}
                  className={`color-btn ${currentColor === color ? 'active' : ''}`}
                  style={{ background: color }}
                  onClick={() => setCurrentColor(color)}
                  title={color}
                />
              ))}
            </div>
          </div>

          <button className="btn-danger clear-btn" onClick={handleClearCanvas}>
            🗑️ Clear
          </button>
        </div>
      )}

      <div className="canvas-wrapper" ref={containerRef}>
        <canvas
          ref={canvasRef}
          className={`drawing-canvas ${isCurrentDrawer ? 'active' : 'disabled'}`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!isCurrentDrawer && (
          <div className="canvas-overlay">
            <p>🎨 Watch and guess the drawing!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;
