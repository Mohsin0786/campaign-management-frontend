export default function Pagination({ onPrev, onNext, hasNext, hasPrev, isLoading }) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
      <button
        onClick={onPrev}
        disabled={!hasPrev || isLoading}
        className="btn-secondary"
      >
        ← Previous
      </button>
      <button
        onClick={onNext}
        disabled={!hasNext || isLoading}
        className="btn-secondary"
      >
        Next →
      </button>
    </div>
  )
}
