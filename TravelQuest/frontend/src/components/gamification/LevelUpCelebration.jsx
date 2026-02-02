import React, { useEffect, useMemo } from "react";
import "./LevelUpCelebration.css";

function usePrefersReducedMotion() {
  return useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
}

/**
 * Simple confetti (CSS) — no libs.
 * If you prefer a lib later (canvas-confetti), swap implementation easily.
 */
function Confetti({ active }) {
  const reduce = usePrefersReducedMotion();
  if (!active || reduce) return null;

  const pieces = Array.from({ length: 180 }).map((_, i) => {
    // Random start position across entire viewport
    const startX = Math.random() * 100; // 0-100vw
    const startY = Math.random() * 100; // 0-100vh (full height)
    
    // Random end position (fall down and spread sideways)
    const endX = (Math.random() - 0.5) * 240; // -120px to +120px horizontal drift
    const endY = Math.random() * 400 + 300; // 300-700px downward
    
    // Random rotation
    const rotation = Math.random() * 720; // 0-720 degrees
    
    return {
      startX,
      startY,
      endX,
      endY,
      rotation,
      delay: Math.random() * 300, // staggered random delays
      duration: 2400 + Math.random() * 1400, // 2.4-3.8 seconds
    };
  });

  return (
    <div className="lvc-confetti" aria-hidden="true">
      {pieces.map((piece, i) => (
        <span 
          key={i} 
          className="lvc-confetti-piece" 
          style={{ 
            "--startX": `${piece.startX}vw`,
            "--startY": `${piece.startY}vh`,
            "--endX": `${piece.endX}px`,
            "--endY": `${piece.endY}px`,
            "--rotation": `${piece.rotation}deg`,
            "--delay": `${piece.delay}ms`,
            "--duration": `${piece.duration}ms`,
          }} 
        />
      ))}
    </div>
  );
}

export default function LevelUpCelebration({
  open,
  newLevel,
  onClose,
  autoCloseMs = 2200,
}) {
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    if (!open) return;
    if (reduce) return;

    const t = setTimeout(() => {
      onClose?.();
    }, autoCloseMs);

    return () => clearTimeout(t);
  }, [open, autoCloseMs, onClose, reduce]);

  // ESC close
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="lvc-backdrop" role="dialog" aria-modal="true">
      <Confetti active={open} />

      <div className="lvc-modal">
        <h3 className="lvc-title">Congratulations!</h3>
        <p className="lvc-text">
          You've leveled up to <b>Level {newLevel}</b>!
        </p>

        <button className="lvc-close" onClick={onClose} type="button">
          OK
        </button>
      </div>
    </div>
  );
}
