export default function ProgressBar({ value = 0, max = 100, color = 'blue', showLabel = true }) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0
  const colors = {
    blue:  'bg-blue-500',
    green: 'bg-green-500',
    red:   'bg-red-500',
  }
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        {showLabel && (
          <>
            <span className="text-xs text-gray-500">{value.toLocaleString()} / {max.toLocaleString()}</span>
            <span className="text-xs font-medium text-gray-700">{pct}%</span>
          </>
        )}
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`${colors[color]} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
