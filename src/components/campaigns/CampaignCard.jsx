import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import StatusBadge from '../shared/StatusBadge.jsx'
import ProgressBar from '../shared/ProgressBar.jsx'
import LoadingSpinner from '../shared/LoadingSpinner.jsx'
import { startCampaign } from '../../api/campaigns.js'

export default function CampaignCard({ campaign }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const startMutation = useMutation({
    mutationFn: () => startCampaign(campaign._id),
    onSuccess: (data) => {
      toast.success(`Campaign started! ${data.totalCount.toLocaleString()} messages queued.`)
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
    onError: (err) => toast.error(err.message),
  })

  const sentPct = campaign.totalCount > 0
    ? Math.round(((campaign.sentCount + campaign.failedCount) / campaign.totalCount) * 100)
    : 0

  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 mr-3">
          <h3 className="font-semibold text-gray-900 truncate">{campaign.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Created {new Date(campaign.createdAt).toLocaleDateString()}
          </p>
        </div>
        <StatusBadge status={campaign.status} />
      </div>

      {/* Template preview */}
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{campaign.messageTemplate}</p>

      {/* Stats */}
      {campaign.totalCount > 0 && (
        <div className="mb-4">
          <ProgressBar value={campaign.sentCount + campaign.failedCount} max={campaign.totalCount} color="green" />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span className="text-green-600 font-medium">✓ {campaign.sentCount.toLocaleString()} sent</span>
            <span className="text-red-500">✗ {campaign.failedCount.toLocaleString()} failed</span>
            <span className="text-yellow-600">⏳ {campaign.pendingCount.toLocaleString()} pending</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/campaigns/${campaign._id}`)}
          className="btn-secondary flex-1 justify-center"
        >
          View Details
        </button>
        {campaign.status === 'draft' && (
          <button
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isPending}
            className="btn-success flex-1 justify-center"
          >
            {startMutation.isPending ? <><LoadingSpinner size="sm" /> Starting...</> : '▶ Start'}
          </button>
        )}
      </div>
    </div>
  )
}
