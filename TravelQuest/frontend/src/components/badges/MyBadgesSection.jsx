import React, { useEffect, useMemo, useState } from "react";
import BadgeCard from "./BadgeCard";
import Loader from "../common/Loader";
import {
  getMyBadges,
  selectBadge,
  clearSelectedBadge,
  devUnlockBadgesForUser,
} from "../../services/badgeService";
import { useAuth } from "../../context/AuthContext";
import "./Badges.css";

function Chevron({ open }) {
  return (
    <svg
      className={`badges-chevron ${open ? "open" : ""}`}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function MyBadgesSection({ onSelectedChange, defaultOpen = true }) {
  const { userId } = useAuth();

  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ✅ dropdown state
  const [open, setOpen] = useState(defaultOpen);

  const selectedBadge = useMemo(
    () => badges.find((b) => b.selected) || null,
    [badges]
  );
  const selectedBadgeId = selectedBadge?.id ?? null;

  async function refreshBadges({ notifyParent = false } = {}) {
    const data = await getMyBadges();
    const list = Array.isArray(data) ? data : [];
    setBadges(list);

    if (notifyParent) {
      const sel = list.find((b) => b.selected) || null;
      onSelectedChange?.(sel ? { id: sel.id, name: sel.name, code: sel.code } : null);
    }
  }

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr("");

      try {
        await refreshBadges({ notifyParent: true });
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Failed to load badges.");
        setBadges([]);
        onSelectedChange?.(null);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSelect(badgeId) {
    try {
      // click pe badge-ul deja selectat => clear
      if (selectedBadgeId === badgeId) {
        await clearSelectedBadge();
      } else {
        await selectBadge(badgeId);
      }

      await refreshBadges({ notifyParent: true });
      setErr("");

    } catch (e) {
      alert(e?.message || "Failed to update selected badge");
    }
  }

  async function handleDevUnlock() {
    try {
      await devUnlockBadgesForUser(userId);
      await refreshBadges({ notifyParent: true });
      setErr("");
      setOpen(true); // după unlock, deschidem ca să vadă ce s-a întâmplat
    } catch (e) {
      alert(e?.message || "Dev unlock failed");
    }
  }

  const lockedCount = useMemo(
    () => badges.filter((b) => !b.unlocked).length,
    [badges]
  );

  return (
    <div className="badges-shell">
      {/* HEADER */}
      <div className="badges-header-new">
        <h3 className="badges-title">My Badges</h3>
        {import.meta.env.DEV && (
          <span
            className="badges-dev-btn"
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              handleDevUnlock();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleDevUnlock();
              }
            }}
          >
            Unlock eligible
          </span>
        )}
      </div>

      {selectedBadge && (
        <div className="badges-selected-info">
          <span className="badges-pill">
            Visible: <b>{selectedBadge.name}</b>
          </span>
        </div>
      )}

      {/* BODY (collapsible) */}
      <div className={`badges-collapsible ${open ? "open" : ""}`}>
        <div className="badges-collapsible-inner">
          {err && <div className="badge-banner">{err}</div>}

          {loading ? (
            <Loader label="Loading badges..." />
          ) : (
            <div className="badges-grid">
              {badges.map((b) => (
                <BadgeCard
                  key={b.id}
                  badge={b}
                  unlocked={!!b.unlocked}
                  selected={!!b.selected}
                  onSelect={() => handleSelect(b.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
