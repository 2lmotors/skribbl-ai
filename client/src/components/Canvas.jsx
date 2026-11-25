import React, { useRef, useEffect, useState, useCallback } from 'react';
import { performFloodFill } from '../utils/floodFill.js';
import { Trash2, RotateCcw, Circle, Square, RectangleHorizontal, Triangle, Plus, Minus, Check } from 'lucide-react';
import { sound } from '../utils/sound.js';
import { socket } from '../utils/socket.js';

const VIRTUAL_WIDTH = 1000;
const VIRTUAL_HEIGHT = 650;

export default function Canvas({
  isDrawer,
  activeTool = 'brush',
  activeColor = '#000000',
  brushSize = 8,
  onDrawAction,
  onSnapshotReady,
  onClear,
  onUndo,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const undoStackRef = useRef([]);

  // Gestion des formes géométriques rapides
  // activeShape: { shape: 'circle'|'square'|'rectangle'|'triangle', x: 0..1, y: 0..1, scale: 1.0, color, size }
  const [activeShape, setActiveShape] = useState(null);
  const [isDraggingShape, setIsDraggingShape] = useState(false);
  const [remoteShapePreview, setRemoteShapePreview] = useState(null);

  // Initialisation du Canvas avec fond blanc
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    try {
      undoStackRef.current = [ctx.getImageData(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT)];
    } catch (e) {}
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  // Sauvegarder un instantané pour le Undo
  const saveUndoSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    try {
      const snap = ctx.getImageData(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
      undoStackRef.current.push(snap);
      if (undoStackRef.current.length > 25) {
        undoStackRef.current.shift();
      }
    } catch (e) {}
  }, []);

  // Envoi d'une capture périodique pour l'analyse IA
  const sendSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onSnapshotReady) return;
    const dataUrl = canvas.toDataURL('image/png', 0.7);
    onSnapshotReady(dataUrl);
  }, [onSnapshotReady]);

  // Tracer une forme creuse sur le contexte 2D
  const drawHollowShape = useCallback((ctx, shape, cx, cy, scale, color, size) => {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color || '#000000';
    ctx.lineWidth = (size || 8) * 1.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const baseDim = 120 * (scale || 1.0);

    if (shape === 'circle') {
      ctx.arc(cx, cy, baseDim / 2, 0, Math.PI * 2);
    } else if (shape === 'square') {
      ctx.strokeRect(cx - baseDim / 2, cy - baseDim / 2, baseDim, baseDim);
    } else if (shape === 'rectangle') {
      const w = baseDim * 1.5;
      const h = baseDim * 0.9;
      ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
    } else if (shape === 'triangle') {
      const r = baseDim / 2;
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r * 0.866, cy + r * 0.5);
      ctx.lineTo(cx - r * 0.866, cy + r * 0.5);
      ctx.closePath();
    }
    ctx.stroke();
    ctx.restore();
  }, []);

  // Annuler le dernier trait
  const performUndo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || undoStackRef.current.length <= 1) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    undoStackRef.current.pop();
    const previous = undoStackRef.current[undoStackRef.current.length - 1];
    if (previous) {
      ctx.putImageData(previous, 0, 0);
    }
    sendSnapshot();
  }, [sendSnapshot]);

  // Exécution d'une action de dessin sur le contexte
  const applyDrawAction = useCallback((action) => {
    const canvas = canvasRef.current;
    if (!canvas || !action) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (action.type === 'clear') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
      try {
        undoStackRef.current = [ctx.getImageData(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT)];
      } catch (e) {}
      setRemoteShapePreview(null);
      return;
    }

    if (action.type === 'undo') {
      performUndo();
      return;
    }

    if (action.type === 'shape_preview') {
      // Prévisualisation d'une forme en mouvement chez les autres joueurs
      setRemoteShapePreview(action.shape ? action : null);
      return;
    }

    if (action.type === 'shape') {
      // Forme définitive cuite sur le canvas
      setRemoteShapePreview(null);
      drawHollowShape(
        ctx,
        action.shape,
        action.x * VIRTUAL_WIDTH,
        action.y * VIRTUAL_HEIGHT,
        action.scale || 1.0,
        action.color || '#000000',
        action.size || 8
      );
      saveUndoSnapshot();
      return;
    }

    if (action.type === 'fill') {
      performFloodFill(
        ctx,
        action.x * VIRTUAL_WIDTH,
        action.y * VIRTUAL_HEIGHT,
        action.color || '#000000'
      );
      saveUndoSnapshot();
      return;
    }

    if (action.type === 'start') {
      const x = action.x * VIRTUAL_WIDTH;
      const y = action.y * VIRTUAL_HEIGHT;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = action.tool === 'eraser' ? '#ffffff' : (action.color || '#000000');
      ctx.lineWidth = (action.size || 8) * (action.tool === 'eraser' ? 2 : 1);

      ctx.lineTo(x + 0.1, y + 0.1);
      ctx.stroke();
      lastPointRef.current = { x, y };
      return;
    }

    if (action.type === 'draw') {
      if (!lastPointRef.current) {
        lastPointRef.current = { x: action.x * VIRTUAL_WIDTH, y: action.y * VIRTUAL_HEIGHT };
        return;
      }
      const currentX = action.x * VIRTUAL_WIDTH;
      const currentY = action.y * VIRTUAL_HEIGHT;

      const midPoint = {
        x: (lastPointRef.current.x + currentX) / 2,
        y: (lastPointRef.current.y + currentY) / 2,
      };

      ctx.quadraticCurveTo(
        lastPointRef.current.x,
        lastPointRef.current.y,
        midPoint.x,
        midPoint.y
      );
      ctx.stroke();
      lastPointRef.current = { x: currentX, y: currentY };
      return;
    }

    if (action.type === 'end') {
      lastPointRef.current = null;
      ctx.closePath();
    }
  }, [drawHollowShape, performUndo, saveUndoSnapshot]);

  // ÉCOUTE DIRECTE DU SOCKET SANS PERTE DE PAQUETS (0 TRAIT MANQUANT)
  useEffect(() => {
    const handleDrawEvent = (action) => {
      applyDrawAction(action);
    };

    const handleDrawHistory = (actions) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
      lastPointRef.current = null;
      if (Array.isArray(actions) && actions.length > 0) {
        actions.forEach((act) => applyDrawAction(act));
      }
      sendSnapshot();
    };

    socket.on('draw_event', handleDrawEvent);
    socket.on('draw_history', handleDrawHistory);

    return () => {
      socket.off('draw_event', handleDrawEvent);
      socket.off('draw_history', handleDrawHistory);
    };
  }, [applyDrawAction]);

  // Conversion normalisée [0..1]
  const getNormalizedCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0.5, y: 0.5 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    return { x, y };
  };

  // Cuire définitivement la forme active sur le canvas
  const bakeActiveShape = useCallback(() => {
    if (!activeShape) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    drawHollowShape(
      ctx,
      activeShape.shape,
      activeShape.x * VIRTUAL_WIDTH,
      activeShape.y * VIRTUAL_HEIGHT,
      activeShape.scale,
      activeColor,
      brushSize
    );

    const action = {
      type: 'shape',
      shape: activeShape.shape,
      x: activeShape.x,
      y: activeShape.y,
      scale: activeShape.scale,
      color: activeColor,
      size: brushSize,
    };

    if (onDrawAction) onDrawAction(action);
    saveUndoSnapshot();
    sendSnapshot();

    // Effacer le preview distant
    if (onDrawAction) onDrawAction({ type: 'shape_preview', shape: null });
    setActiveShape(null);
    setIsDraggingShape(false);
    sound.playPop();
  }, [activeShape, activeColor, brushSize, drawHollowShape, onDrawAction, saveUndoSnapshot, sendSnapshot]);

  // Démarrer la sélection d'une forme depuis la barre supérieure (sans relâcher le doigt)
  const handleShapeSelectStart = (shapeKey, e) => {
    if (!isDrawer) return;
    if (e.cancelable && e.type.startsWith('touch')) e.preventDefault();

    // Si une forme était déjà posée, la valider d'abord
    if (activeShape) {
      bakeActiveShape();
    }

    const coords = getNormalizedCoords(e);
    const initialShape = {
      shape: shapeKey,
      x: coords.x || 0.5,
      y: coords.y || 0.5,
      scale: 1.0,
      color: activeColor,
      size: brushSize,
    };

    setActiveShape(initialShape);
    setIsDraggingShape(true);

    // Émettre le preview pour les autres joueurs avec effet zoom
    if (onDrawAction) {
      onDrawAction({
        type: 'shape_preview',
        shape: shapeKey,
        x: initialShape.x,
        y: initialShape.y,
        scale: 1.15, // Zoom pendant le glissement
        color: activeColor,
        size: brushSize,
      });
    }

    sound.playPop();

    // Écouteurs globaux pour suivre le doigt sans relâcher
    const handleMove = (moveEvent) => {
      if (moveEvent.cancelable && moveEvent.type.startsWith('touch')) moveEvent.preventDefault();
      const newCoords = getNormalizedCoords(moveEvent);

      setActiveShape((prev) => {
        if (!prev) return null;
        const updated = { ...prev, x: newCoords.x, y: newCoords.y };
        if (onDrawAction) {
          onDrawAction({
            type: 'shape_preview',
            shape: updated.shape,
            x: updated.x,
            y: updated.y,
            scale: 1.15, // Zoom maintenu pendant le glissement
            color: activeColor,
            size: brushSize,
          });
        }
        return updated;
      });
    };

    const handleUp = () => {
      setIsDraggingShape(false);
      // À la dépose, l'effet de zoom disparaît (échelle normale 1.0)
      setActiveShape((prev) => {
        if (!prev) return null;
        const updated = { ...prev, scale: 1.0 };
        if (onDrawAction) {
          onDrawAction({
            type: 'shape_preview',
            shape: updated.shape,
            x: updated.x,
            y: updated.y,
            scale: 1.0,
            color: activeColor,
            size: brushSize,
          });
        }
        return updated;
      });

      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
      window.removeEventListener('touchcancel', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);
    window.addEventListener('touchcancel', handleUp);
  };

  // Ajustement de la taille de la forme (+ / - 10%)
  const handleScaleShape = (delta) => {
    if (!activeShape) return;
    const newScale = Math.max(0.3, Math.min(2.5, activeShape.scale * (1 + delta)));
    const updated = { ...activeShape, scale: newScale };
    setActiveShape(updated);

    // Retransmission en direct de la mise à l'échelle aux autres joueurs
    if (onDrawAction) {
      onDrawAction({
        type: 'shape_preview',
        shape: updated.shape,
        x: updated.x,
        y: updated.y,
        scale: newScale,
        color: activeColor,
        size: brushSize,
      });
    }
    sound.playPop();
  };

  // Début du tracé libre
  const startDrawing = (e) => {
    if (!isDrawer) return;
    if (e.type === 'touchstart') e.preventDefault();

    // Si une forme géométrique était en cours d'ajustement, la poser avant de dessiner
    if (activeShape) {
      bakeActiveShape();
      return;
    }

    const { x, y } = getNormalizedCoords(e);

    if (activeTool === 'bucket') {
      const action = {
        type: 'fill',
        x,
        y,
        color: activeColor,
      };
      applyDrawAction(action);
      if (onDrawAction) onDrawAction(action);
      sendSnapshot();
      return;
    }

    isDrawingRef.current = true;
    const action = {
      type: 'start',
      x,
      y,
      color: activeColor,
      size: brushSize,
      tool: activeTool,
    };

    applyDrawAction(action);
    if (onDrawAction) onDrawAction(action);
  };

  // Déplacement / Tracé continu
  const draw = (e) => {
    if (!isDrawer || !isDrawingRef.current) return;
    if (e.type === 'touchmove') e.preventDefault();

    const { x, y } = getNormalizedCoords(e);
    const action = { type: 'draw', x, y };

    applyDrawAction(action);
    if (onDrawAction) onDrawAction(action);
  };

  // Fin du tracé
  const stopDrawing = (e) => {
    if (!isDrawer || !isDrawingRef.current) return;
    if (e && e.type === 'touchend') e.preventDefault();

    isDrawingRef.current = false;
    const action = { type: 'end' };
    applyDrawAction(action);
    if (onDrawAction) onDrawAction(action);

    saveUndoSnapshot();
    sendSnapshot();
  };

  // Rendu SVG d'une forme pour la prévisualisation fluide
  const renderShapeSvg = (shapeObj, isZoomed = false) => {
    if (!shapeObj || !shapeObj.shape) return null;
    const { shape, x, y, scale = 1.0, color = activeColor, size = brushSize } = shapeObj;
    const effectiveScale = isZoomed ? scale * 1.15 : scale;
    const baseW = 120 * effectiveScale;
    const baseH = shape === 'rectangle' ? baseW * 0.6 : baseW;
    const strokeWidth = (size || 8) * 1.2;

    const left = `${x * 100}%`;
    const top = `${y * 100}%`;

    return (
      <div
        style={{
          position: 'absolute',
          left,
          top,
          transform: 'translate(-50%, -50%)',
          width: baseW,
          height: baseH,
          pointerEvents: 'none',
          transition: isDraggingShape ? 'transform 0.05s ease-out' : 'all 0.15s ease-out',
        }}
        className={isZoomed ? 'filter drop-shadow-[0_0_12px_rgba(99,102,241,0.6)]' : ''}
      >
        <svg width="100%" height="100%" viewBox={`0 0 ${baseW} ${baseH}`}>
          {shape === 'circle' && (
            <circle
              cx={baseW / 2}
              cy={baseH / 2}
              r={(baseW - strokeWidth) / 2}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={isZoomed ? '6,4' : 'none'}
            />
          )}
          {shape === 'square' && (
            <rect
              x={strokeWidth / 2}
              y={strokeWidth / 2}
              width={baseW - strokeWidth}
              height={baseW - strokeWidth}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={isZoomed ? '6,4' : 'none'}
            />
          )}
          {shape === 'rectangle' && (
            <rect
              x={strokeWidth / 2}
              y={strokeWidth / 2}
              width={baseW - strokeWidth}
              height={baseH - strokeWidth}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={isZoomed ? '6,4' : 'none'}
            />
          )}
          {shape === 'triangle' && (
            <polygon
              points={`${baseW / 2},${strokeWidth} ${baseW - strokeWidth},${baseH - strokeWidth} ${strokeWidth},${baseH - strokeWidth}`}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={isZoomed ? '6,4' : 'none'}
            />
          )}
        </svg>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[16/10] bg-white rounded-2xl overflow-hidden shadow-2xl border-2 sm:border-4 border-slate-800 touch-none select-none"
    >
      {/* ── BARRE DE FORMES RAPIDES SUR LE HAUT DU DESSIN (DESSINATEUR UNIQUEMENT) ── */}
      {isDrawer && (
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1 bg-slate-950/85 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-lg pointer-events-auto">
          <span className="text-[10px] font-bold text-slate-400 px-1 hidden sm:inline">Formes :</span>

          {/* Cercle Creux */}
          <button
            type="button"
            onPointerDown={(e) => handleShapeSelectStart('circle', e)}
            title="Glisser-déposer un Cercle Creux"
            className="p-1.5 hover:bg-indigo-600/40 active:scale-95 text-slate-200 hover:text-white rounded-lg transition"
          >
            <Circle className="w-4 h-4 text-indigo-400" />
          </button>

          {/* Carré Creux */}
          <button
            type="button"
            onPointerDown={(e) => handleShapeSelectStart('square', e)}
            title="Glisser-déposer un Carré Creux"
            className="p-1.5 hover:bg-indigo-600/40 active:scale-95 text-slate-200 hover:text-white rounded-lg transition"
          >
            <Square className="w-4 h-4 text-indigo-400" />
          </button>

          {/* Rectangle Creux */}
          <button
            type="button"
            onPointerDown={(e) => handleShapeSelectStart('rectangle', e)}
            title="Glisser-déposer un Rectangle Creux"
            className="p-1.5 hover:bg-indigo-600/40 active:scale-95 text-slate-200 hover:text-white rounded-lg transition"
          >
            <RectangleHorizontal className="w-4 h-4 text-indigo-400" />
          </button>

          {/* Triangle Creux */}
          <button
            type="button"
            onPointerDown={(e) => handleShapeSelectStart('triangle', e)}
            title="Glisser-déposer un Triangle Creux"
            className="p-1.5 hover:bg-indigo-600/40 active:scale-95 text-slate-200 hover:text-white rounded-lg transition"
          >
            <Triangle className="w-4 h-4 text-indigo-400" />
          </button>
        </div>
      )}

      {/* Boutons flottants Undo & Effacer (Dessinateur uniquement) */}
      {isDrawer && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-20 pointer-events-auto">
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              if (activeShape) {
                setActiveShape(null);
                if (onDrawAction) onDrawAction({ type: 'shape_preview', shape: null });
                return;
              }
              if (onDrawAction) onDrawAction({ type: 'undo' });
              if (onUndo) onUndo();
              performUndo();
              sound.playPop();
            }}
            title="Annuler le dernier trait (Undo)"
            className="px-2 sm:px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 active:scale-90 text-white rounded-xl border border-slate-700 shadow-md backdrop-blur transition flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
            <span className="text-[10px] sm:text-xs font-bold hidden sm:inline">Annuler</span>
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              if (activeShape) setActiveShape(null);
              if (onClear) {
                onClear();
              } else {
                applyDrawAction({ type: 'clear' });
                if (onDrawAction) onDrawAction({ type: 'clear' });
              }
              sound.playPop();
            }}
            title="Effacer tout le dessin pour recommencer"
            className="px-2.5 py-1.5 bg-rose-600/90 hover:bg-rose-600 active:scale-90 text-white rounded-xl border border-rose-400 shadow-md backdrop-blur transition flex items-center gap-1.5 font-bold text-xs"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            <span className="text-[11px] sm:text-xs font-bold">Effacer</span>
          </button>
        </div>
      )}

      {/* ── PRÉVISUALISATION DE FORME EN DIRECT (VISIBLE PAR TOUS, BULLES VISIBLES QUE PAR LE DESSINATEUR) ── */}
      {/* 1. Forme du dessinateur local */}
      {activeShape && renderShapeSvg(activeShape, isDraggingShape)}

      {/* 2. Forme distante pour les devineurs */}
      {!isDrawer && remoteShapePreview && renderShapeSvg(remoteShapePreview, false)}

      {/* 3. BULLES DE TRANSFORMATION (+10% / -10% / Valider) : DESSINATEUR UNIQUEMENT */}
      {isDrawer && activeShape && !isDraggingShape && (
        <div
          style={{
            position: 'absolute',
            left: `${activeShape.x * 100}%`,
            top: `${activeShape.y * 100}%`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
          className="z-30 flex items-center justify-between w-[160px] sm:w-[190px]"
        >
          {/* Bulle "-" à gauche pour diminuer de 10% */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleScaleShape(-0.1);
            }}
            title="Diminuer la taille de 10%"
            className="w-8 h-8 rounded-full bg-slate-900 border-2 border-indigo-400 text-white flex items-center justify-center shadow-2xl hover:bg-indigo-600 active:scale-90 transition pointer-events-auto"
          >
            <Minus className="w-4 h-4 font-black" />
          </button>

          {/* Bulle "✓" au centre pour valider */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              bakeActiveShape();
            }}
            title="Poser la forme sur le dessin"
            className="w-8 h-8 rounded-full bg-emerald-600 border-2 border-emerald-300 text-white flex items-center justify-center shadow-2xl hover:bg-emerald-500 active:scale-90 transition pointer-events-auto"
          >
            <Check className="w-4 h-4 font-black" />
          </button>

          {/* Bulle "+" à droite pour agrandir de 10% */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleScaleShape(0.1);
            }}
            title="Agrandir la taille de 10%"
            className="w-8 h-8 rounded-full bg-slate-900 border-2 border-indigo-400 text-white flex items-center justify-center shadow-2xl hover:bg-indigo-600 active:scale-90 transition pointer-events-auto"
          >
            <Plus className="w-4 h-4 font-black" />
          </button>
        </div>
      )}

      {/* Le Canvas 2D principal */}
      <canvas
        ref={canvasRef}
        width={VIRTUAL_WIDTH}
        height={VIRTUAL_HEIGHT}
        className={`w-full h-full block drawing-canvas ${
          isDrawer ? 'cursor-crosshair' : 'cursor-default pointer-events-none'
        }`}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
    </div>
  );
}
