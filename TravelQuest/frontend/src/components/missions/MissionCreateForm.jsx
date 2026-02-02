import { useEffect, useMemo, useState } from "react";
import "./missions.css";
import DatePickerField from "../ui/DatePickerField";
import { getMissionMeta } from "../../services/missionService";

function todayYYYYMMDD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseYMD(value) {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return { y, m, d };
}

function toLocalOffsetISO(ymd, { endOfDay }) {
  const p = parseYMD(ymd);
  if (!p) return null;

  const hh = endOfDay ? 23 : 0;
  const min = endOfDay ? 59 : 0;
  const sec = endOfDay ? 59 : 0;
  const ms = endOfDay ? 999 : 0;

  const dt = new Date(p.y, p.m - 1, p.d, hh, min, sec, ms);

  const offsetMin = -dt.getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMin);
  const offH = String(Math.floor(abs / 60)).padStart(2, "0");
  const offM = String(abs % 60).padStart(2, "0");

  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  const HH = String(dt.getHours()).padStart(2, "0");
  const MI = String(dt.getMinutes()).padStart(2, "0");
  const SS = String(dt.getSeconds()).padStart(2, "0");
  const MS = String(dt.getMilliseconds()).padStart(3, "0");

  return `${yyyy}-${mm}-${dd}T${HH}:${MI}:${SS}.${MS}${sign}${offH}:${offM}`;
}

function slugifyCode(str) {
  return (str || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 100);
}

export default function MissionCreateForm({ onCreate }) {
  const minDate = useMemo(() => todayYYYYMMDD(), []);

  const [meta, setMeta] = useState(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState(null);

  const [values, setValues] = useState({
    role: "",
    type: "",
    target_value: 5,

    category: "",

    start_at: "",
    end_at: "",

    title: "",

    xp_reward: 0,
    real_reward_title: "",
    real_reward_description: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  // ✅ Load metadata from backend
  useEffect(() => {
    let alive = true;

    (async () => {
      setMetaLoading(true);
      setMetaError(null);
      try {
        const m = await getMissionMeta();
        if (!alive) return;

        setMeta(m);

        // init role/type defaults from meta
        const roles = m?.roles || [];
        const types = m?.types || [];

        const defaultRole = roles[0] || "";
        const defaultType = types.find((t) => t.role === defaultRole)?.value || types[0]?.value || "";

        setValues((v) => ({
          ...v,
          role: v.role || defaultRole,
          type: v.type || defaultType,
          real_reward_title: v.real_reward_title || "Voucher",
        }));
      } catch (e) {
        if (!alive) return;
        setMetaError(e?.message || "Failed to load mission metadata.");
        setMeta(null);
      } finally {
        if (!alive) return;
        setMetaLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const roles = meta?.roles || [];
  const types = meta?.types || [];
  const categories = meta?.categories || [];

  const availableTypes = useMemo(() => {
    return types.filter((t) => t.role === values.role);
  }, [types, values.role]);

  const typeMeta = useMemo(() => {
    return availableTypes.find((t) => t.value === values.type) || availableTypes[0] || null;
  }, [availableTypes, values.type]);

  // keep selected type valid if role changes
  useEffect(() => {
    if (!meta) return;
    if (!values.role) return;

    const ok = availableTypes.some((t) => t.value === values.type);
    if (!ok) {
      const first = availableTypes[0];
      setValues((v) => ({
        ...v,
        type: first?.value || "",
        category: "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.role, meta, availableTypes]);

  const needsCategory = !!typeMeta?.paramsSchema?.category;

  const onChange = (e) => {
    const { name, value } = e.target;

    setValues((v) => {
      const next = { ...v, [name]: value };

      if (name === "role") {
        // reset dependent fields
        next.category = "";
      }

      if (name === "type") {
        // if type doesn't require category, clear it
        const nextType = types.find((t) => t.value === value);
        if (!nextType?.paramsSchema?.category) next.category = "";
      }

      if (name === "target_value") next.target_value = Number(value);
      if (name === "xp_reward") next.xp_reward = Number(value);

      // if start date becomes after end date, clear end date
      if (name === "start_at" && v.end_at && value && v.end_at < value) {
        next.end_at = "";
      }

      return next;
    });
  };

  const disabled = metaLoading || !!metaError || !meta;

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (disabled) return;

    if (!values.role || !values.type) {
      setMsg({ type: "error", text: "Role and objective type are required." });
      return;
    }

    if (!values.end_at) {
      setMsg({ type: "error", text: "End date is required." });
      return;
    }

    if (values.end_at < minDate) {
      setMsg({ type: "error", text: "End date must be today or later." });
      return;
    }
    if (values.start_at && values.start_at < minDate) {
      setMsg({ type: "error", text: "Start date must be today or later." });
      return;
    }
    if (values.start_at && values.end_at && values.end_at < values.start_at) {
      setMsg({ type: "error", text: "End date must be the same day or after start date." });
      return;
    }

    const target = Number(values.target_value || 0);
    if (!target || target <= 0) {
      setMsg({ type: "error", text: "Target value must be > 0." });
      return;
    }

    if (needsCategory && !values.category?.trim()) {
      setMsg({ type: "error", text: "Category is required for this objective." });
      return;
    }

    // missions.params
    const paramsObj = {};
    if (needsCategory) paramsObj.category = values.category.trim();
    const params = Object.keys(paramsObj).length ? paramsObj : null;

    // missions.code (hidden in UI, required by DB)
    const codeBase = `${values.type}_${target}${paramsObj.category ? "_" + paramsObj.category : ""}`;
    const code = slugifyCode(codeBase);

    // timestamptz
    const start_at = values.start_at ? toLocalOffsetISO(values.start_at, { endOfDay: false }) : null;
    const end_at = toLocalOffsetISO(values.end_at, { endOfDay: true });

    const payload = {
      // missions.*
      code,
      title: values.title?.trim() || codeBase.replaceAll("_", " "),
      description: null,
      role: values.role,
      type: values.type,
      target_value: target,
      params,
      start_at,
      end_at,

      // mission_rewards.*
      reward: {
        xp_reward: Number(values.xp_reward || 0) || 0,
        real_reward_title: values.real_reward_title?.trim() || null,
        real_reward_description: values.real_reward_description?.trim() || null,
      },
    };

    setSubmitting(true);
    try {
      const res = await onCreate(payload);
      if (!res?.ok) throw new Error(res?.message || "Create failed.");
      setMsg({ type: "success", text: "Mission created." });

      setValues((v) => ({
        ...v,
        target_value: 5,
        category: "",
        start_at: "",
        end_at: "",
        title: "",
        xp_reward: 0,
        real_reward_description: "",
      }));
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Create failed." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="ms-form" onSubmit={onSubmit}>

      {metaError ? (
        <div className="ms-form-msg ms-form-error">{metaError}</div>
      ) : null}

      <label className="ms-label">
        <span className="ms-label-title">
          Role <span className="ms-required">*</span>
        </span>
        <select
          className="ms-input"
          name="role"
          value={values.role}
          onChange={onChange}
          disabled={disabled || submitting}
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <label className="ms-label">
        <span className="ms-label-title">
          Objective type <span className="ms-required">*</span>
        </span>
        <select
          className="ms-input"
          name="type"
          value={values.type}
          onChange={onChange}
          disabled={disabled || submitting}
        >
          {availableTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label || t.value}
            </option>
          ))}
        </select>
      </label>

      {needsCategory && (
        <label className="ms-label">
          <span className="ms-label-title">
            Category <span className="ms-required">*</span>
          </span>
          <select
            className="ms-input"
            name="category"
            value={values.category}
            onChange={onChange}
            disabled={disabled || submitting}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="ms-row">
        <label className="ms-label">
          <span className="ms-label-title">
            Target value <span className="ms-required">*</span>
          </span>
          <input
            className="ms-input"
            type="number"
            min={1}
            name="target_value"
            value={values.target_value}
            onChange={onChange}
            disabled={disabled || submitting}
          />
        </label>

        <label className="ms-label">
          XP 
          <input
            className="ms-input"
            type="number"
            min={0}
            name="xp_reward"
            value={values.xp_reward}
            onChange={onChange}
            disabled={disabled || submitting}
          />
        </label>
      </div>

      <div className="ms-row">
        <DatePickerField
          label="Start date (optional)"
          value={values.start_at}
          onChange={(v) =>
            setValues((prev) => {
              const next = { ...prev, start_at: v };
              if (next.end_at && v && next.end_at < v) next.end_at = "";
              return next;
            })
          }
          minDate={minDate}
          align="left"
          disabled={disabled || submitting}
        />

        <DatePickerField
          label="End date"
          value={values.end_at}
          onChange={(v) => setValues((prev) => ({ ...prev, end_at: v }))}
          minDate={minDate}
          required
          align="right"
          disabled={disabled || submitting}
        />
      </div>

      <label className="ms-label">
        Title 
        <input
          className="ms-input"
          name="title"
          value={values.title}
          onChange={onChange}
          placeholder="Optional"
          disabled={disabled || submitting}
        />
        <div className="ms-help">Leave empty to use an auto title.</div>
      </label>

      <div className="ms-divider" />
      <div className="ms-form-title2">Reward</div>

      <label className="ms-label">
        Reward Name
        <input
          className="ms-input"
          name="real_reward_title"
          value={values.real_reward_title}
          onChange={onChange}
          placeholder="ex: Voucher transport gratuit"
          disabled={disabled || submitting}
        />
      </label>

      <label className="ms-label">
        Reward description 
        <textarea
          className="ms-input ms-textarea"
          name="real_reward_description"
          value={values.real_reward_description}
          onChange={onChange}
          placeholder="Optional notes"
          disabled={disabled || submitting}
        />
      </label>

      {msg ? (
        <div className={`ms-form-msg ${msg.type === "error" ? "ms-form-error" : "ms-form-success"}`}>
          {msg.text}
        </div>
      ) : null}

      <button className="ms-submit" type="submit" disabled={disabled || submitting}>
        {submitting ? "Creating..." : "Create mission"}
      </button>
    </form>
  );
}
