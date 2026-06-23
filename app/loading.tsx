export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 h-8 w-44 rounded-lg bg-surface" />
      <div className="mx-auto mt-2 size-64 rounded-full bg-surface" />
      <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-surface" />
        ))}
      </div>
      <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-44 rounded-2xl bg-surface" />
        ))}
      </div>
    </div>
  );
}
