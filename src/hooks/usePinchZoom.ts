import { useState, useCallback, useRef } from 'react';
import { useMotionValue, MotionValue } from 'framer-motion';

interface UsePinchZoomOptions {
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
}

interface UsePinchZoomReturn {
  scale: MotionValue<number>;
  x: MotionValue<number>;
  y: MotionValue<number>;
  currentScale: number;
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
  };
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setScale: (scale: number) => void;
}

/**
 * Hook for pinch-to-zoom and pan functionality.
 * Works with Framer Motion's motion values for smooth animations.
 *
 * @param options - Configuration options
 * @returns Zoom state, motion values, and handlers
 */
export function usePinchZoom(options: UsePinchZoomOptions = {}): UsePinchZoomReturn {
  const { minScale = 0.5, maxScale = 2.5, initialScale = 1 } = options;

  const scale = useMotionValue(initialScale);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const [currentScale, setCurrentScale] = useState(initialScale);

  // Track touch state
  const lastDistance = useRef(0);
  const lastCenter = useRef({ x: 0, y: 0 });
  const isPinching = useRef(false);
  const isPanning = useRef(false);
  const lastTouchCount = useRef(0);

  const getDistance = (touches: React.TouchList): number => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
  };

  const getCenter = (touches: React.TouchList): { x: number; y: number } => {
    if (touches.length < 2) {
      return { x: touches[0]?.clientX || 0, y: touches[0]?.clientY || 0 };
    }
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  };

  const clampScale = useCallback(
    (value: number): number => Math.min(maxScale, Math.max(minScale, value)),
    [minScale, maxScale]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touches = e.touches;

    if (touches.length === 2) {
      // Start pinch
      isPinching.current = true;
      isPanning.current = false;
      lastDistance.current = getDistance(touches);
      lastCenter.current = getCenter(touches);
    } else if (touches.length === 1) {
      // Start pan
      isPanning.current = true;
      isPinching.current = false;
      lastCenter.current = { x: touches[0].clientX, y: touches[0].clientY };
    }

    lastTouchCount.current = touches.length;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touches = e.touches;

      if (isPinching.current && touches.length === 2) {
        e.preventDefault();

        // Calculate pinch scale
        const newDistance = getDistance(touches);
        const scaleChange = newDistance / lastDistance.current;
        const newScale = clampScale(scale.get() * scaleChange);

        // Calculate pinch center movement for pan during zoom
        const newCenter = getCenter(touches);
        const centerDeltaX = newCenter.x - lastCenter.current.x;
        const centerDeltaY = newCenter.y - lastCenter.current.y;

        scale.set(newScale);
        setCurrentScale(newScale);

        x.set(x.get() + centerDeltaX);
        y.set(y.get() + centerDeltaY);

        lastDistance.current = newDistance;
        lastCenter.current = newCenter;
      } else if (isPanning.current && touches.length === 1) {
        // Pan with single finger
        const touch = touches[0];
        const deltaX = touch.clientX - lastCenter.current.x;
        const deltaY = touch.clientY - lastCenter.current.y;

        x.set(x.get() + deltaX);
        y.set(y.get() + deltaY);

        lastCenter.current = { x: touch.clientX, y: touch.clientY };
      }

      lastTouchCount.current = touches.length;
    },
    [scale, x, y, clampScale]
  );

  const handleTouchEnd = useCallback(() => {
    isPinching.current = false;
    isPanning.current = false;
    lastDistance.current = 0;
  }, []);

  const zoomIn = useCallback(() => {
    const newScale = clampScale(scale.get() + 0.25);
    scale.set(newScale);
    setCurrentScale(newScale);
  }, [scale, clampScale]);

  const zoomOut = useCallback(() => {
    const newScale = clampScale(scale.get() - 0.25);
    scale.set(newScale);
    setCurrentScale(newScale);
  }, [scale, clampScale]);

  const resetZoom = useCallback(() => {
    scale.set(initialScale);
    x.set(0);
    y.set(0);
    setCurrentScale(initialScale);
  }, [scale, x, y, initialScale]);

  const setScaleValue = useCallback(
    (newScale: number) => {
      const clamped = clampScale(newScale);
      scale.set(clamped);
      setCurrentScale(clamped);
    },
    [scale, clampScale]
  );

  return {
    scale,
    x,
    y,
    currentScale,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    zoomIn,
    zoomOut,
    resetZoom,
    setScale: setScaleValue,
  };
}
