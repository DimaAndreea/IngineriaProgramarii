import React from "react";

export default function ItineraryHeader({ title, startDate, endDate }) {
  return (
    <div className="itinerary-header">
      <h1 className="itinerary-title">{title || "Active itinerary"}</h1>
      
      {startDate && endDate && (
        <div className="itinerary-period">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="calendar-icon">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="period-date">
            {(() => {
              const date = new Date(startDate);
              return `${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getFullYear()}`;
            })()}
          </span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="arrow-icon">
            <path d="M2 8H14M10 4L14 8L10 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="period-date">
            {(() => {
              const date = new Date(endDate);
              return `${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getFullYear()}`;
            })()}
          </span>
        </div>
      )}
    </div>
  );
}
