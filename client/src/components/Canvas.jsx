import React, { useRef, useEffect, useState, useCallback } from 'react';
import { performFloodFill } from '../utils/floodFill.js';
import { Trash2, RotateCcw } from 'lucide-react';
import { sound } from '../utils/sound.js';

const VIRTUAL_WIDTH = 1000;
const VIRTUAL_HEIGHT = 650;

export default function Canvas({
  isDrawer,
  activeTool = 'brush',
  activeColor = '#000000',
  brushSize = 8,
  onDrawAction,
  externalAction,
  onSnapshotReady,
  onClear,
  onUndo,
}) {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const undoStackRef = useRef([]); // Historique pour le undo

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
      if (undoStackRef.current.length > 20) {
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
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (action.type === 'clear') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
      try {
        undoStackRef.current = [ctx.getImageData(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT)];
      } catch (e) {}
      return;
    }

    if (action.type === 'undo') {
      performUndo();
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

      // Dessiner un point dès le clic initial
      ctx.lineTo(x + 0.1, y + 0.1);
      ctx.stroke();
      lastPointRef.current = { x, y };
      return;
    }

    if (action.type === 'draw') {
      if (!lastPointRef.current) return;
      const currentX = action.x * VIRTUAL_WIDTH;
      const currentY = action.y * VIRTUAL_HEIGHT;

      // Lissage par courbe quadratique
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
  }, []);

  // Écouter les actions distantes venant des autres joueurs via Socket.io
  useEffect(() => {
    if (externalAction) {
      applyDrawAction(externalAction);
    }
  }, [externalAction, applyDrawAction]);

  // Conversion des coordonnées de la souris / tactile en coordonnées virtuelles normalisées [0..1]
  const getNormalizedCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

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

  // Début du tracé
  const startDrawing = (e) => {
    if (!isDrawer) return;
    if (e.type === 'touchstart') e.preventDefault();

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

    // Sauvegarde pour le Undo et capture pour l'IA
    saveUndoSnapshot();
    sendSnapshot();
  };

  return (
    <div className="relative w-full aspect-[16/10] bg-white rounded-2xl overflow-hidden shadow-2xl border-2 sm:border-4 border-slate-800">
      {/* Boutons flottants de correction dans le coin supérieur droit du canvas */}
      {isDrawer && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-20 pointer-events-auto">
          {/* Bouton Flèche Annuler (Undo) */}
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              performUndo();
              if (onDrawAction) onDrawAction({ type: 'undo' });
              if (onUndo) onUndo();
              sound.playPop();
            }}
            title="Annuler le dernier trait (Undo)"
            className="px-2 sm:px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 active:scale-90 text-white rounded-xl border border-slate-700 shadow-md backdrop-blur transition flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
            <span className="text-[10px] sm:text-xs font-bold hidden sm:inline">Annuler</span>
          </button>

          {/* Bouton Effacer tout */}
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
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
