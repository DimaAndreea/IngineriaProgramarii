// src/components/missions/Toast.jsx
import "./missions.css";

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div className={`ms-toast ms-toast-${toast.type}`}>
      <div className="ms-toast-text">{toast.message}</div>
      <button className="ms-toast-close" onClick={onClose} aria-label="Close">
        ✕
      </button>
    </div>
  );
}
