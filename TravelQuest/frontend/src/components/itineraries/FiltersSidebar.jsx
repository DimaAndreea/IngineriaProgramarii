import React from "react";
import "./FiltersSidebar.css";

export default function FiltersSidebar({ filters, setFilters }) {

  function toggleCategory(key) {
    setFilters(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        all: false,
        [key]: !prev.categories[key],
      }
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

      price: { min: 0, max: 5000 },

      sort: "none",

      rating: "",
      searchGlobal: prev.searchGlobal
    }));
  }

  return (
    <div className="filters-panel">
      <h3>Filters</h3>

      {/* CHECKBOX CATEGORIES */}
      {[
        ["all", "All itineraries"],
        ["mine", "My itineraries"],
        ["approved", "Approved"],
        ["pending", "Pending"],
        ["rejected", "Rejected"],
        ["others", "Other guides"],
      ].map(([key, label]) => (
        <label className="checkbox-item" key={key}>
          <input
            type="checkbox"
            checked={filters.categories[key]}
            onChange={() => toggleCategory(key)}
          />
          {label}
        </label>
      ))}

      {/* DATE FILTER */}
      <h3 className="section-title">Date range</h3>

      <label>Start date from:</label>
      <input
        type="date"
        className="filter-date"
        value={filters.dates.startFrom}
        onChange={e =>
          setFilters(prev => ({
            ...prev,
            dates: { ...prev.dates, startFrom: e.target.value }
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
            dates: { ...prev.dates, startTo: e.target.value }
          }))
        }
      />

      {/* PRICE FILTER */}
      <h3 className="section-title">Price</h3>

      <label>Min: {filters.price.min} RON</label>
      <input
        type="range"
        min="0"
        max="5000"
        value={filters.price.min}
        onChange={e =>
          setFilters(prev => ({
            ...prev,
            price: { ...prev.price, min: Number(e.target.value) }
          }))
        }
      />

      <label>Max: {filters.price.max} RON</label>
      <input
        type="range"
        min="0"
        max="5000"
        value={filters.price.max}
        onChange={e =>
          setFilters(prev => ({
            ...prev,
            price: { ...prev.price, max: Number(e.target.value) }
          }))
        }
      />

      {/* RATING FILTER */}
      <h3 className="section-title">Rating</h3>

      {[5,4,3,2,1].map(stars => (
        <label className="rating-item" key={stars}>
          <input
            type="checkbox"
            checked={filters.rating === String(stars)}
            onChange={() =>
              setFilters(prev => ({
                ...prev,
                rating: prev.rating === String(stars) ? "" : String(stars)
              }))
            }
          />
          <span className="stars">{"★".repeat(stars)}{"☆".repeat(5-stars)}</span>
        </label>
      ))}

      {/* SORT FILTER (NEW) */}
      <h3 className="section-title">Sort by</h3>
      <select
        className="sort-select"
        value={filters.sort}
        onChange={e =>
          setFilters(prev => ({
            ...prev,
            sort: e.target.value
          }))
        }
      >
        <option value="none">— Select —</option>
        <option value="priceAsc">Price: Low → High</option>
        <option value="priceDesc">Price: High → Low</option>
      </select>

      {/* RESET BTN */}
      <button className="reset-btn" onClick={resetFilters}>
        Reset filters
      </button>
    </div>
  );
}
