import React from "react";
import "./Modal.css";

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="tq-modal-backdrop" onMouseDown={onClose} role="dialog" aria-modal="true">
      <div className="tq-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="tq-modal-head">
          <h3 className="tq-modal-title">{title}</h3>
          <button className="tq-modal-x" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="tq-modal-body">{children}</div>
      </div>
    </div>
  );
}
