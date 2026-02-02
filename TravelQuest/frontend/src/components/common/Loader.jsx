import React from "react";
import "./Loader.css";

export default function Loader({ label = "Loading...", size = 56, className = "" }) {
  return (
    <div
      className={`tq-loader ${className}`.trim()}
      style={{ "--loader-size": `${size}px` }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="tq-loader-ring" aria-hidden="true" />
      {label ? <span className="tq-loader-text">{label}</span> : null}
    </div>
  );
}
