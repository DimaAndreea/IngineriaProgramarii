export default function Select({ label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      
      <select
        {...props}
        className="
          border border-gray-300 rounded-md px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-400
        "
      />
      
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
