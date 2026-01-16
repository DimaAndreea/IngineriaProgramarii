import { useEffect, useMemo, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import "./DatePickerField.css";

function toYYYYMMDD(date) {
  if (!date) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseYYYYMMDD(value) {
  if (!value) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

export default function DatePickerField({
  label,
  value, // "YYYY-MM-DD"
  onChange,
  placeholder = "Select date",
  disabledBeforeToday = false,
  minDate,
  required = false,
  align = "left", // ✅ NEW: "left" | "right"
}) {
  const [open, setOpen] = useState(false);
  const popRef = useRef(null);

  const selected = useMemo(() => parseYYYYMMDD(value), [value]);

  const disabled = useMemo(() => {
    if (minDate) return { before: parseYYYYMMDD(minDate) };
    if (disabledBeforeToday) return { before: new Date() };
    return undefined;
  }, [disabledBeforeToday, minDate]);

  // close on outside click
  useEffect(() => {
    if (!open) return;

    const onDoc = (e) => {
      if (!popRef.current) return;
      if (!popRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const handleSelect = (date) => {
    if (!date) return;
    onChange?.(toYYYYMMDD(date));
    setOpen(false);
  };

  return (
    <div className="dp-field" ref={popRef}>
      {label && (
        <div className="dp-label">
          {label} {required && <span className="dp-req">*</span>}
        </div>
      )}

      <button
        type="button"
        className={`dp-input ${open ? "dp-input-open" : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={value ? "dp-value" : "dp-placeholder"}>
          {value || placeholder}
        </span>
        <span className="dp-icon">📅</span>
      </button>

      {open && (
        <div
          className={`dp-popover ${
            align === "right" ? "dp-popover-right" : "dp-popover-left"
          }`}
        >
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            disabled={disabled}
            weekStartsOn={1}
          />

          <div className="dp-actions">
            <button
              type="button"
              className="dp-clear"
              onClick={() => {
                onChange?.("");
                setOpen(false);
              }}
            >
              Clear
            </button>

            <button
              type="button"
              className="dp-today"
              onClick={() => {
                const today = new Date();
                onChange?.(toYYYYMMDD(today));
                setOpen(false);
              }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
