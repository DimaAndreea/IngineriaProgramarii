import React from "react";

export default function Input({ label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <input
        {...props}
        className={`
          border rounded-md px-3 py-2 text-sm
          focus:outline-none focus:ring-2
          ${error ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"}
        `}
      />
      
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
