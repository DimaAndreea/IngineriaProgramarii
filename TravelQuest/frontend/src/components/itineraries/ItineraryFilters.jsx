import React from "react";
import "./ItineraryFilters.css";

export default function ItineraryFilters({ filters, onChange, isGuide }) {

  function updateField(field, value) {
    onChange({ ...filters, [field]: value });
  }

  return (
    <div className="filters-panel">
      <h3 className="filters-title">Filters</h3>

      {/* search by title */}
      <div className="filter-group">
        <label>Search by title</label>
        <input
          type="text"
          value={filters.searchTitle}
          onChange={(e) => updateField("searchTitle", e.target.value)}
          placeholder="Type title..."
        />
      </div>

      {/* search by location */}
      <div className="filter-group">
        <label>Search by location</label>
        <input
          type="text"
          value={filters.searchLocation}
          onChange={(e) => updateField("searchLocation", e.target.value)}
          placeholder="City or country..."
        />
      </div>

      {isGuide && (
        <>
          <div className="filter-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={filters.onlyMine}
                onChange={(e) => updateField("onlyMine", e.target.checked)}
              />
              Show only my itineraries
            </label>
          </div>

          <div className="filter-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={filters.onlyRejected}
                onChange={(e) => updateField("onlyRejected", e.target.checked)}
              />
              Show only rejected
            </label>
          </div>

          <div className="filter-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={filters.othersApproved}
                onChange={(e) => updateField("othersApproved", e.target.checked)}
              />
              Approved from other guides
            </label>
          </div>
        </>
      )}
    </div>
  );
}
