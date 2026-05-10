import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getCampaign, startCampaign, getCampaignAnalytics } from '../api/campaigns.js'
import StatusBadge from '../components/shared/StatusBadge.jsx'
import StatCard from '../components/campaigns/StatCard.jsx'
import ProgressBar from '../components/shared/ProgressBar.jsx'
import AnalyticsChart from '../components/campaigns/AnalyticsChart.jsx'
import LoadingSpinner from '../components/shared/LoadingSpinner.jsx'
import ErrorMessage from '../components/shared/ErrorMessage.jsx'

export default function CampaignDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Poll campaign stats while running
  const { data: campaign, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['campaign', id],
    queryFn:  () => getCampaign(id),
    refetchInterval: (query) => query?.state?.data?.status === 'running' ? 3000 : false,
    staleTime: 0, // Always fetch fresh data when navigating to detail page
  })

  // Poll analytics while running
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['campaign-analytics', id],
    queryFn:  () => getCampaignAnalytics(id),
    enabled:  !!campaign,
    refetchInterval: (query) => {
      const campaignData = query?.state?.data
      return campaignData?.status === 'running' ? 10000 : false
    },
    staleTime: 0, // Always fetch fresh analytics data
  })

  const startMutation = useMutation({
    mutationFn: () => startCampaign(id),
    onSuccess: (data) => {
      toast.success(`Campaign started! ${data.totalCount.toLocaleString()} messages queued.`)
      queryClient.invalidateQueries({ queryKey: ['campaign', id] })
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
    onError: (err) => toast.error(err.message),
  })

  if (isLoading) return (
    <div className="flex items-center justify-center py-32">
      <LoadingSpinner size="lg" />
    </div>
  )

  if (isError) return <ErrorMessage message={error?.message} onRetry={refetch} />

  const sentPct = campaign.totalCount > 0
    ? Math.round(((campaign.sentCount + campaign.failedCount) / campaign.totalCount) * 100)
    : 0

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/campaigns')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
              <StatusBadge status={campaign.status} />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Created {new Date(campaign.createdAt).toLocaleDateString()}
              {campaign.startedAt && ` · Started ${new Date(campaign.startedAt).toLocaleString()}`}
              {campaign.completedAt && ` · Completed ${new Date(campaign.completedAt).toLocaleString()}`}
            </p>
          </div>
        </div>

        {campaign.status === 'draft' && (
          <button
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isPending}
            className="btn-success"
          >
            {startMutation.isPending
              ? <><LoadingSpinner size="sm" /> Starting...</>
              : '▶ Start Campaign'
            }
          </button>
        )}
      </div>

      {/* Message template */}
      <div className="card p-4">
        <p className="text-xs font-medium text-gray-500 uppercase mb-2">Message Template</p>
        <p className="text-gray-700">{campaign.messageTemplate}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total"   value={campaign.totalCount}   color="blue"   icon="📊" />
        <StatCard label="Sent"    value={campaign.sentCount}    color="green"  icon="✅" />
        <StatCard label="Failed"  value={campaign.failedCount}  color="red"    icon="❌" />
        <StatCard label="Pending" value={campaign.pendingCount} color="yellow" icon="⏳" />
      </div>

      {/* Progress bar */}
      {campaign.totalCount > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-semibold text-gray-900">{sentPct}%</span>
          </div>
          <ProgressBar
            value={campaign.sentCount + campaign.failedCount}
            max={campaign.totalCount}
            color={campaign.status === 'failed' ? 'red' : 'green'}
            showLabel={false}
          />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span className="text-green-600">✓ {campaign.sentCount.toLocaleString()} sent</span>
            <span className="text-red-500">✗ {campaign.failedCount.toLocaleString()} failed</span>
            <span className="text-yellow-600">⏳ {campaign.pendingCount.toLocaleString()} pending</span>
          </div>
        </div>
      )}

      {/* Analytics chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Messages Over Time</h2>
          {campaign.status === 'running' && (
            <span className="text-xs text-blue-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              Live — refreshes every 10s
            </span>
          )}
        </div>
        <AnalyticsChart data={analytics} isLoading={analyticsLoading} />
      </div>

      {/* Audience filter info */}
      {campaign.audienceFilter && Object.keys(campaign.audienceFilter).length > 0 && (
        <div className="card p-4">
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Audience Filter</p>
          <pre className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 overflow-x-auto">
            {JSON.stringify(campaign.audienceFilter, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
