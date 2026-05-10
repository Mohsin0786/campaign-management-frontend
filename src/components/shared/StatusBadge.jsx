export default function StatusBadge({ status }) {
  const map = {
    draft:      'bg-gray-100 text-gray-700',
    running:    'bg-blue-100 text-blue-700',
    completed:  'bg-green-100 text-green-700',
    failed:     'bg-red-100 text-red-700',
    paused:     'bg-yellow-100 text-yellow-700',
    queued:     'bg-purple-100 text-purple-700',
    processing: 'bg-orange-100 text-orange-700',
    done:       'bg-green-100 text-green-700',
    pending:    'bg-gray-100 text-gray-600',
    sent:       'bg-green-100 text-green-700',
  }
  return (
    <span className={`badge ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status === 'running' && (
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
      )}
      {status}
    </span>
  )
}
