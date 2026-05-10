import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Modal from '../shared/Modal.jsx'
import LoadingSpinner from '../shared/LoadingSpinner.jsx'
import { useCampaignForm } from '../../hooks/useCampaignForm.js'
import { createCampaign } from '../../api/campaigns.js'

const TAGS = ['vip', 'enterprise', 'trial', 'churned', 'active', 'newsletter', 'premium', 'basic']

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {['Details', 'Audience', 'Review'].map((label, i) => {
        const n = i + 1
        const active = n === current
        const done   = n < current
        return (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
              done   ? 'bg-green-500 text-white' :
              active ? 'bg-blue-600 text-white' :
                       'bg-gray-100 text-gray-400'
            }`}>
              {done ? '✓' : n}
            </div>
            <span className={`text-sm ${active ? 'font-medium text-gray-900' : 'text-gray-400'}`}>{label}</span>
            {i < 2 && <div className="w-8 h-px bg-gray-200 mx-1" />}
          </div>
        )
      })}
    </div>
  )
}

export default function CreateCampaignModal({ isOpen, onClose }) {
  const queryClient = useQueryClient()
  const {
    form, setField, nextStep, prevStep, setAudienceType,
    setFilterTags, setFilterDate, reset, buildAudienceFilter, isStep1Valid,
  } = useCampaignForm()



  const createMutation = useMutation({
    mutationFn: () => createCampaign({
      name:            form.name,
      messageTemplate: form.messageTemplate,
      audienceFilter:  buildAudienceFilter(),
    }),
    onSuccess: () => {
      toast.success('Campaign created!')
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      reset()
      onClose()
    },
    onError: (err) => toast.error(err.message),
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  const toggleTag = (tag) => {
    const next = form.filterTags.includes(tag)
      ? form.filterTags.filter(t => t !== tag)
      : [...form.filterTags, tag]
    setFilterTags(next)
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Campaign" size="lg">
      <StepIndicator current={form.step} />

      {/* Step 1: Details */}
      {form.step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="label">Campaign Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              placeholder="e.g. Summer Promotion"
              className="input"
            />
          </div>
          <div>
            <label className="label">Message Template *</label>
            <textarea
              value={form.messageTemplate}
              onChange={e => setField('messageTemplate', e.target.value)}
              placeholder="Hi {{name}}, we have an exclusive offer for you!"
              rows={4}
              className="input resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">Use {'{{name}}'} for personalization</p>
          </div>
        </div>
      )}

      {/* Step 2: Audience */}
      {form.step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="label">Target Audience</label>
            <div className="flex gap-3">
              {['all', 'filtered'].map(type => (
                <button
                  key={type}
                  onClick={() => setAudienceType(type)}
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    form.audienceType === type
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {type === 'all' ? '👥 All Contacts' : '🎯 Filtered Contacts'}
                </button>
              ))}
            </div>
          </div>

          {form.audienceType === 'filtered' && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
              <div>
                <label className="label text-xs">Filter by Tags</label>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                        form.filterTags.includes(tag)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Created After</label>
                  <input type="date" className="input" value={form.filterCreatedAfter}
                    onChange={e => setFilterDate({ filterCreatedAfter: e.target.value })} />
                </div>
                <div>
                  <label className="label text-xs">Created Before</label>
                  <input type="date" className="input" value={form.filterCreatedBefore}
                    onChange={e => setFilterDate({ filterCreatedBefore: e.target.value })} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Review */}
      {form.step === 3 && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Campaign Name</p>
              <p className="font-semibold text-gray-900">{form.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Message Template</p>
              <p className="text-gray-700 text-sm bg-white rounded-lg p-3 border border-gray-200 mt-1">{form.messageTemplate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Audience</p>
              <p className="text-gray-700 text-sm mt-0.5">
                {form.audienceType === 'all'
                  ? 'All contacts'
                  : `Filtered: ${form.filterTags.length ? form.filterTags.join(', ') : 'date range only'}`
                }
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500">Campaign will be created as <strong>Draft</strong>. Start it manually from the campaigns list.</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200 mt-6">
        <button onClick={form.step > 1 ? prevStep : handleClose} className="btn-secondary">
          {form.step === 1 ? 'Cancel' : '← Back'}
        </button>
        {form.step < 3
          ? <button onClick={nextStep} disabled={form.step === 1 && !isStep1Valid} className="btn-primary">
              Next →
            </button>
          : <button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="btn-primary"
            >
              {createMutation.isPending ? <><LoadingSpinner size="sm" /> Creating...</> : 'Create Campaign'}
            </button>
        }
      </div>
    </Modal>
  )
}
