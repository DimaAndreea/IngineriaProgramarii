import React from "react";
import "./ProgressBar.css";

export default function ProgressBar({ stages = [], currentStage = 0 }) {
  const getLabel = (stage, index) => {
    if (typeof stage === "string") return stage;
    if (stage && typeof stage === "object") {
      return stage.city || stage.name || stage.title || `Step ${index + 1}`;
    }
    return `Step ${index + 1}`;
  };

  return (
    <div className="progress-wrapper">
      <div className="progress-line"></div>

      <div className="steps">
        {stages.map((stage, index) => (
          <div key={index} className="step-item">
            <div
              className={
                index === currentStage
                  ? "step-circle active"
                  : index < currentStage
                  ? "step-circle done"
                  : "step-circle"
              }
            >
              {index + 1}
            </div>

            <span className="step-label">{getLabel(stage, index)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
