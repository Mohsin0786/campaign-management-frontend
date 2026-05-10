export default function StatCard({ label, value, color = 'gray', icon }) {
  const colors = {
    gray:   'bg-gray-50 text-gray-700 border-gray-200',
    green:  'bg-green-50 text-green-700 border-green-200',
    red:    'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    blue:   'bg-blue-50 text-blue-700 border-blue-200',
  }
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium uppercase tracking-wider opacity-70">{label}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <p className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  )
}
