import React from "react";
import "./FiltersSidebar.css";

export default function FiltersSidebar({ filters, setFilters, role }) {
  const isGuide = role === "guide";
  const isTourist = role === "tourist";

  function toggleCategoryGroup(key) {
    setFilters(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        all: false,
        [key]: !prev.categories[key],
      },
    }));
  }

  function toggleType(key) {
    setFilters(prev => ({
      ...prev,
      category: {
        ...prev.category,
        [key]: !prev.category[key],
      },
    }));
  }

  function resetFilters() {
    setFilters(prev => ({
      categories: {
        all: true,
        mine: false,
        approved: false,
        pending: false,
        rejected: false,
        others: false,
      },

      dates: { startFrom: "", startTo: "" },

      price: { min: 0, max: 50000 },

      category: {
        cultural: false,
        adventure: false,
        citybreak: false,
        entertainment: false,
        exotic: false,
      },

      sort: "none",
      rating: "",
      searchGlobal: prev.searchGlobal,
    }));
  }

  const visibilityOptions = isGuide
    ? [
        ["all", "All itineraries"],
        ["mine", "My itineraries"],
        ["approved", "Published"],
        ["pending", "Pending"],
        ["rejected", "Rejected"],
        ["others", "Other guides"],
      ]
    : [
        ["all", "All itineraries"],
        ["approved", "Published"],
        ["pending", "Pending"],
        ["rejected", "Rejected"],
      ];

  return (
    <div className="filters-panel">
      {/* ---------- VISIBILITY GROUP (hidden for tourists) ---------- */}
      {!isTourist && (
        <details className="filter-box" open>
          <summary>{isGuide ? "Ownership & Status" : "Status"}</summary>

          <div className="filter-content">
            {visibilityOptions.map(([key, label]) => (
              <label key={key} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={filters.categories[key]}
                  onChange={() => toggleCategoryGroup(key)}
                />
                {label}
              </label>
            ))}
          </div>
        </details>
      )}

      {/* ---------- CATEGORY FILTER ---------- */}
      <details className="filter-box" open>
        <summary>Category</summary>
        <div className="filter-content">
          {[
            ["cultural", "Cultural"],
            ["adventure", "Adventure"],
            ["citybreak", "City Break"],
            ["entertainment", "Entertainment"],
            ["exotic", "Exotic"],
          ].map(([key, label]) => (
            <label key={key} className="checkbox-item">
              <input
                type="checkbox"
                checked={filters.category[key]}
                onChange={() => toggleType(key)}
              />
              {label}
            </label>
          ))}
        </div>
      </details>

      {/* ---------- DATE FILTER ---------- */}
      <details className="filter-box" open>
        <summary>Date range</summary>
        <div className="filter-content">
          <label>Start date from:</label>
          <input
            type="date"
            className="filter-date"
            value={filters.dates.startFrom}
            onChange={e =>
              setFilters(prev => ({
                ...prev,
                dates: { ...prev.dates, startFrom: e.target.value },
              }))
            }
          />

          <label>Start date to:</label>
          <input
            type="date"
            className="filter-date"
            value={filters.dates.startTo}
            onChange={e =>
              setFilters(prev => ({
                ...prev,
                dates: { ...prev.dates, startTo: e.target.value },
              }))
            }
          />
        </div>
      </details>

      {/* ---------- PRICE FILTER ---------- */}
      <details className="filter-box" open>
        <summary>Price</summary>
        <div className="filter-content">
          <div className="price-labels">
            <div className="price-input-wrapper">
              <span className="price-prefix">lei</span>
              <input
                type="number"
                min="0"
                max="50000"
                value={filters.price.min}
                onChange={e => {
                  const newMin = Number(e.target.value);
                  if (newMin >= 0 && newMin <= filters.price.max) {
                    setFilters(prev => ({
                      ...prev,
                      price: { ...prev.price, min: newMin },
                    }));
                  }
                }}
                className="price-input"
              />
            </div>
            <div className="price-input-wrapper">
              <span className="price-prefix">lei</span>
              <input
                type="number"
                min="0"
                max="50000"
                value={filters.price.max}
                onChange={e => {
                  const newMin = Number(e.target.value);
                  if (newMin >= filters.price.min && newMin <= 50000) {
                    setFilters(prev => ({
                      ...prev,
                      price: { ...prev.price, max: newMin },
                    }));
                  }
                }}
                className="price-input"
              />
              <span className="price-suffix">+</span>
            </div>
          </div>
          
          <div className="dual-range-slider">
            <input
              type="range"
              min="0"
              max="50000"
              step="100"
              value={filters.price.min}
              onChange={e => {
                const newMin = Number(e.target.value);
                if (newMin <= filters.price.max) {
                  setFilters(prev => ({
                    ...prev,
                    price: { ...prev.price, min: newMin },
                  }));
                }
              }}
              className="range-min"
            />
            <input
              type="range"
              min="0"
              max="50000"
              step="100"
              value={filters.price.max}
              onChange={e => {
                const newMax = Number(e.target.value);
                if (newMax >= filters.price.min) {
                  setFilters(prev => ({
                    ...prev,
                    price: { ...prev.price, max: newMax },
                  }));
                }
              }}
              className="range-max"
            />
          </div>
        </div>
      </details>

      {/* ---------- RATING ---------- */}
      <details className="filter-box" open>
        <summary>Guide Rating</summary>
        <div className="filter-content">
          {[5, 4, 3, 2, 1].map(stars => (
            <label key={stars} className="rating-item">
              <input
                type="checkbox"
                checked={filters.rating === String(stars)}
                onChange={() =>
                  setFilters(prev => ({
                    ...prev,
                    rating: prev.rating === String(stars) ? "" : String(stars),
                  }))
                }
                className="rating-checkbox"
              />
              <span className="stars">
                {"★".repeat(stars)}
                {"☆".repeat(5 - stars)}
              </span>
              <span className="rating-badge">
                {stars}{stars === 5 ? "" : "+"}
              </span>
            </label>
          ))}
        </div>
      </details>

      {/* ---------- SORT BY PRICE ---------- */}
      <details className="filter-box" open>
        <summary>Sort by Price</summary>
        <div className="filter-content">
          <label className="sort-option">
            <input
              type="radio"
              name="sort"
              value="priceAsc"
              checked={filters.sort === "priceAsc"}
              onChange={e =>
                setFilters(prev => ({ ...prev, sort: e.target.value }))
              }
              className="sort-radio"
            />
            <span className="sort-label">Low → High</span>
          </label>
          <label className="sort-option">
            <input
              type="radio"
              name="sort"
              value="priceDesc"
              checked={filters.sort === "priceDesc"}
              onChange={e =>
                setFilters(prev => ({ ...prev, sort: e.target.value }))
              }
              className="sort-radio"
            />
            <span className="sort-label">High → Low</span>
          </label>
          <label className="sort-option">
            <input
              type="radio"
              name="sort"
              value="none"
              checked={filters.sort === "none"}
              onChange={e =>
                setFilters(prev => ({ ...prev, sort: e.target.value }))
              }
              className="sort-radio"
            />
            <span className="sort-label">None</span>
          </label>
        </div>
      </details>

      <button className="reset-btn" onClick={resetFilters}>
        Reset filters
      </button>
    </div>
  );
}
