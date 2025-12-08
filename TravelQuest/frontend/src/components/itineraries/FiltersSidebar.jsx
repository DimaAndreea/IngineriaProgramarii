import React from "react";
import "./FiltersSidebar.css";

export default function FiltersSidebar({ filters, setFilters, role }) {

    const isGuide = role === "guide";

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

            {/* ---------- VISIBILITY GROUP ---------- */}
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

            {/* ---------- CATEGORY FILTER ---------- */}
            <details className="filter-box">
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
            <details className="filter-box">
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
                </div>
            </details>

            {/* ---------- PRICE FILTER ---------- */}
            <details className="filter-box">
                <summary>Price</summary>
                <div className="filter-content">
                    <label>Min: {filters.price.min} RON</label>
                    <input
                        type="range"
                        min="0"
                        max="50000"
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
                        max="50000"
                        value={filters.price.max}
                        onChange={e =>
                            setFilters(prev => ({
                                ...prev,
                                price: { ...prev.price, max: Number(e.target.value) }
                            }))
                        }
                    />
                </div>
            </details>

            {/* ---------- SORT ---------- */}
            <details className="filter-box">
                <summary>Sort by</summary>
                <div className="filter-content">
                    <select
                        value={filters.sort}
                        onChange={e => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                        className="sort-select"
                    >
                        <option value="none">— None —</option>
                        <option value="priceAsc">Price: Low → High</option>
                        <option value="priceDesc">Price: High → Low</option>
                    </select>
                </div>
            </details>

            {/* ---------- RATING ---------- */}
            <details className="filter-box">
                <summary>Rating</summary>
                <div className="filter-content">
                    {[5,4,3,2,1].map(stars => (
                        <label key={stars} className="rating-item">
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
                </div>
            </details>

            <button className="reset-btn" onClick={resetFilters}>Reset filters</button>
        </div>
    );
}
