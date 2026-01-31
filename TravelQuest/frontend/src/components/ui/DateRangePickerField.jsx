import { useEffect, useMemo, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import "./DateRangePickerField.css";

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

function formatRangeLabel(from, to) {
  if (!from && !to) return "Select dates";
  const fmt = (v) => new Date(v).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (from && !to) return `${fmt(from)} → …`;
  if (from && to) return `${fmt(from)} → ${fmt(to)}`;
  return "Select dates";
}

export default function DateRangePickerField({
  label = "When",
  startDate,
  endDate,
  onChange,
  minDate,
  required = false,
}) {
  const [open, setOpen] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(new Date());
  const popRef = useRef(null);

  const from = useMemo(() => parseYYYYMMDD(startDate), [startDate]);
  const to = useMemo(() => parseYYYYMMDD(endDate), [endDate]);

  const disabled = useMemo(() => {
    if (!minDate) return undefined;
    return { before: parseYYYYMMDD(minDate) };
  }, [minDate]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (!popRef.current) return;
      if (!popRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const handleSelect = (range) => {
    if (!range) return;
    
    // Smart selection: if we already have a start date (from) and user clicks
    // on a date earlier than the start date, reset the start to that earlier date
    if (from && range.from && !range.to && range.from < from) {
      // User clicked on a past date while having a future start date
      onChange?.(toYYYYMMDD(range.from), "");
    } else {
      const nextStart = range.from ? toYYYYMMDD(range.from) : "";
      const nextEnd = range.to ? toYYYYMMDD(range.to) : "";
      onChange?.(nextStart, nextEnd);
    }
  };

  const currentYear = displayMonth.getFullYear();
  const currentMonth = displayMonth.getMonth();

  // Generate year options: current year - 2 years to current year + 10 years
  const yearOptions = [];
  const minYear = new Date().getFullYear() - 2;
  const maxYear = new Date().getFullYear() + 10;
  for (let y = minYear; y <= maxYear; y++) {
    yearOptions.push(y);
  }

  const handleYearChange = (newYear) => {
    setDisplayMonth(new Date(newYear, currentMonth, 1));
  };

  return (
    <div className="drp-field" ref={popRef}>
      <div className="drp-label">
        {label} {required && <span className="drp-req">*</span>}
      </div>

      <button
        type="button"
        className={`drp-input ${open ? "drp-input-open" : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={startDate ? "drp-value" : "drp-placeholder"}>
          {formatRangeLabel(startDate, endDate)}
        </span>
      </button>

      {open && (
        <div className="drp-popover">
          <div className="drp-year-selector">
            <label htmlFor="drp-year-select">Year:</label>
            <select
              id="drp-year-select"
              value={currentYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              className="drp-year-select"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <DayPicker
            mode="range"
            selected={{ from, to }}
            onSelect={handleSelect}
            disabled={disabled}
            weekStartsOn={1}
            numberOfMonths={2}
            month={displayMonth}
            onMonthChange={setDisplayMonth}
          />

          <div className="drp-actions">
            <button
              type="button"
              className="drp-clear"
              onClick={() => {
                onChange?.("", "");
                setOpen(false);
              }}
            >
              Clear
            </button>

            <button
              type="button"
              className="drp-today"
              onClick={() => {
                const today = new Date();
                const iso = toYYYYMMDD(today);
                onChange?.(iso, iso);
                setOpen(false);
              }}
            >
              Today
            </button>

            <button
              type="button"
              className="drp-save"
              onClick={() => {
                setOpen(false);
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
