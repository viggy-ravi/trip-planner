export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-4 w-24 bg-gray-100 rounded mb-4" />
      <div className="h-7 w-56 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-40 bg-gray-100 rounded mb-6" />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <div className="h-6 w-24 bg-gray-200 rounded mb-3" />
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg h-28 bg-gray-100" />
            ))}
          </div>
        </div>
        <div className="lg:w-72 shrink-0">
          <div className="border border-gray-200 rounded-lg h-64 bg-gray-100" />
        </div>
      </div>
    </div>
  );
}
