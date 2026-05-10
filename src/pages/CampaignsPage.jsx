import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCampaigns } from '../api/campaigns.js'
import CampaignCard from '../components/campaigns/CampaignCard.jsx'
import CreateCampaignModal from '../components/campaigns/CreateCampaignModal.jsx'
import LoadingSpinner from '../components/shared/LoadingSpinner.jsx'

const STATUSES = ['all', 'draft', 'running', 'completed', 'failed']

function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3 animate-pulse">
      <div className="flex justify-between">
        <div className="h-5 bg-gray-100 rounded w-1/2" />
        <div className="h-5 bg-gray-100 rounded w-16" />
      </div>
      <div className="h-4 bg-gray-100 rounded w-3/4" />
      <div className="h-2 bg-gray-100 rounded w-full" />
      <div className="flex gap-2">
        <div className="h-9 bg-gray-100 rounded flex-1" />
        <div className="h-9 bg-gray-100 rounded flex-1" />
      </div>
    </div>
  )
}

export default function CampaignsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  const params = statusFilter !== 'all' ? { status: statusFilter } : {}

  // Main query - fetches campaigns based on user's selected filter
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['campaigns', params],
    queryFn:  () => getCampaigns({ ...params, limit: 20 }),
    // Poll if on "running" tab OR if there are running campaigns visible
    refetchInterval: (query) => {
      const campaigns = query?.state?.data?.data || []
      const hasRunning = campaigns.some(c => c.status === 'running')
      return (statusFilter === 'running' || hasRunning) ? 5000 : false
    },
    // Reduce stale time to ensure fresh data when switching tabs
    staleTime: 0,
  })

  const campaigns = data?.data || []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {campaigns.length > 0 ? `${campaigns.length} campaigns` : 'Create and manage message campaigns'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isFetching && !isLoading && <LoadingSpinner size="sm" />}
          <button onClick={() => setCreateOpen(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Campaign
          </button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
              statusFilter === s
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && campaigns.length === 0 && (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">
            {statusFilter === 'all' ? 'No campaigns yet' : `No ${statusFilter} campaigns`}
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            {statusFilter === 'all' ? 'Create your first campaign to get started' : 'Try a different status filter'}
          </p>
          {statusFilter === 'all' && (
            <button onClick={() => setCreateOpen(true)} className="btn-primary mx-auto">
              Create Campaign
            </button>
          )}
        </div>
      )}

      {/* Campaign grid */}
      {!isLoading && campaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map(c => <CampaignCard key={c._id} campaign={c} />)}
        </div>
      )}

      <CreateCampaignModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
