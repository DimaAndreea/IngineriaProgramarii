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

  const pieces = Array.from({ length: 28 });

  return (
    <div className="lvc-confetti" aria-hidden="true">
      {pieces.map((_, i) => (
        <span key={i} className="lvc-confetti-piece" style={{ "--i": i }} />
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
        <div className="lvc-badge" aria-hidden="true">
          ✨
        </div>

        <h3 className="lvc-title">Congratulations!</h3>
        <p className="lvc-text">
          You've leveled up to <b>{newLevel}</b>!
        </p>

        <button className="lvc-close" onClick={onClose} type="button">
          OK
        </button>
      </div>
    </div>
  );
}
