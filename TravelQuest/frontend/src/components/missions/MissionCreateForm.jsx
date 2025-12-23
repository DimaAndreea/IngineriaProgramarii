import { useState } from "react";
import "./missions.css";

export default function MissionCreateForm({ onCreate }) {
  const [values, setValues] = useState({
    title: "",
    description: "",
    deadline: "",
    reward_points: 100,
    status: "ACTIVE",
    scope: "BOTH",
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setSuccess(null);

    const res = await onCreate(values);
    if (!res?.ok) {
      setFormError(res?.message || "Create failed.");
      setSubmitting(false);
      return;
    }

    setSuccess("Mission created successfully.");
    setValues({
      title: "",
      description: "",
      deadline: "",
      reward_points: 100,
      status: "ACTIVE",
      scope: "BOTH",
    });
    setSubmitting(false);
  };

  return (
    <form className="ms-form" onSubmit={onSubmit}>
      <div className="ms-form-header">
        <div className="ms-form-title">Create a new mission</div>
        <div className="ms-form-subtitle">
          Users will be able to join and track progress automatically.
        </div>
      </div>

      <label className="ms-label">
        Title
        <input
          className="ms-input"
          name="title"
          value={values.title}
          onChange={onChange}
          placeholder="e.g. Complete 3 city-break itineraries"
          autoComplete="off"
        />
      </label>

      <label className="ms-label">
        Description
        <textarea
          className="ms-textarea"
          name="description"
          value={values.description}
          onChange={onChange}
          placeholder="Full description shown in the mission details panel..."
          rows={4}
        />
      </label>

      <div className="ms-row">
        <label className="ms-label">
          Deadline
          <input
            className="ms-input"
            type="date"
            name="deadline"
            value={values.deadline}
            onChange={onChange}
          />
        </label>

        <label className="ms-label">
          Reward points
          <input
            className="ms-input"
            type="number"
            name="reward_points"
            value={values.reward_points}
            onChange={onChange}
            min={0}
          />
        </label>
      </div>

      <div className="ms-row">
        <label className="ms-label">
          Status
          <select
            className="ms-input"
            name="status"
            value={values.status}
            onChange={onChange}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="DRAFT">DRAFT</option>
          </select>
        </label>

        <label className="ms-label">
          Scope
          <select
            className="ms-input"
            name="scope"
            value={values.scope}
            onChange={onChange}
          >
            <option value="BOTH">BOTH</option>
            <option value="TOURIST">TOURIST</option>
            <option value="GUIDE">GUIDE</option>
          </select>
        </label>
      </div>

      {formError && <div className="ms-form-msg ms-form-error">{formError}</div>}
      {success && <div className="ms-form-msg ms-form-success">{success}</div>}

      <button className="ms-submit" type="submit" disabled={submitting}>
        {submitting ? "Creating..." : "Create mission"}
      </button>

      <p className="ms-form-footnote">
        * For now this is mock / backend-ready. Later: POST to backend (admin-only).
      </p>
    </form>
  );
}
