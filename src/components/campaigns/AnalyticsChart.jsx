import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import LoadingSpinner from '../shared/LoadingSpinner.jsx'

export default function AnalyticsChart({ data, isLoading }) {
  if (isLoading) return (
    <div className="h-64 flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )

  if (!data?.length) return (
    <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
      No analytics data yet — start the campaign first
    </div>
  )

  // Format hour label for X axis
  const formatted = data.map(d => ({
    ...d,
    hour: d.hour ? new Date(d.hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.hour,
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="failedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          formatter={(value, name) => [value.toLocaleString(), name]}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="sent"   stroke="#22c55e" fill="url(#sentGrad)"   strokeWidth={2} name="Sent" />
        <Area type="monotone" dataKey="failed" stroke="#ef4444" fill="url(#failedGrad)" strokeWidth={2} name="Failed" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
