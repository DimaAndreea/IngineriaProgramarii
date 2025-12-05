import React from "react";
import "./ProgressBar.css";

export default function ProgressBar({ stages, currentStage }) {
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
                        <span className="step-label">{stage}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
