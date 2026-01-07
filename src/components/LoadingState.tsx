export function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-lg border border-gray-800 bg-[#111]"
        >
          <div className="aspect-video bg-gray-800" />
          <div className="p-4">
            <div className="h-5 w-3/4 rounded bg-gray-800" />
            <div className="mt-3 h-4 w-full rounded bg-gray-800" />
            <div className="mt-2 h-4 w-2/3 rounded bg-gray-800" />
            <div className="mt-4 flex justify-between">
              <div className="h-3 w-20 rounded bg-gray-800" />
              <div className="h-3 w-16 rounded bg-gray-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
