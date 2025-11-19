export default function Button({ children, loading, ...props }) {
  return (
    <button
      disabled={loading}
      {...props}
      className="
        w-full py-2 rounded-md text-white font-semibold
        bg-blue-600 hover:bg-blue-700 transition
        disabled:bg-gray-400 disabled:cursor-not-allowed
      "
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
