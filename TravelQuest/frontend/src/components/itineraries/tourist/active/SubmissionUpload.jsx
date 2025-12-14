import React, { useEffect, useState } from "react";

export default function SubmissionUpload({ mission, onSubmit, existingSubmission }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(existingSubmission?.image || null);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSend = () => {
    if (!file) return;
    onSubmit(file);
  };

  const label = mission?.text ?? mission?.name ?? "";

  return (
    <div className="submission-card">
      <p><strong>{label}</strong></p>

      {preview && <img className="submission-preview" src={preview} alt="preview" />}

      <input type="file" accept="image/*" onChange={handleFile} />

      {!existingSubmission && (
        <button className="submit-btn" onClick={handleSend}>
          Send submission
        </button>
      )}

      {existingSubmission && (
        <p className={`submission-status ${existingSubmission.status}`}>
          Status: {existingSubmission.status}
        </p>
      )}
    </div>
  );
}
