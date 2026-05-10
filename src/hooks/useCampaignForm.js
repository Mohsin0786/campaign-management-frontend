import { useReducer, useCallback } from 'react'

const initialState = {
  step: 1,
  name: '',
  messageTemplate: '',
  audienceType: 'all', // 'all' | 'filtered'
  audienceFilter: {},
  filterTags: [],
  filterCreatedAfter: '',
  filterCreatedBefore: '',
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'NEXT_STEP':
      return { ...state, step: Math.min(state.step + 1, 3) }
    case 'PREV_STEP':
      return { ...state, step: Math.max(state.step - 1, 1) }
    case 'SET_AUDIENCE_TYPE':
      return { ...state, audienceType: action.payload, audienceFilter: {} }
    case 'SET_FILTER_TAGS':
      return { ...state, filterTags: action.payload }
    case 'SET_FILTER_DATE':
      return { ...state, ...action.payload }
    case 'RESET':
      return { ...initialState }
    default:
      return state
  }
}

export function useCampaignForm() {
  const [form, dispatch] = useReducer(reducer, initialState)

  const setField        = useCallback((field, value) => dispatch({ type: 'SET_FIELD', field, value }), [])
  const nextStep        = useCallback(() => dispatch({ type: 'NEXT_STEP' }), [])
  const prevStep        = useCallback(() => dispatch({ type: 'PREV_STEP' }), [])
  const setAudienceType = useCallback((v) => dispatch({ type: 'SET_AUDIENCE_TYPE', payload: v }), [])
  const setFilterTags   = useCallback((v) => dispatch({ type: 'SET_FILTER_TAGS', payload: v }), [])
  const setFilterDate   = useCallback((v) => dispatch({ type: 'SET_FILTER_DATE', payload: v }), [])
  const reset           = useCallback(() => dispatch({ type: 'RESET' }), [])

  // Build audienceFilter for API
  const buildAudienceFilter = () => {
    if (form.audienceType === 'all') return {}
    const filter = {}
    if (form.filterTags.length)       filter.tags = form.filterTags
    if (form.filterCreatedAfter)      filter.createdAfter = form.filterCreatedAfter
    if (form.filterCreatedBefore)     filter.createdBefore = form.filterCreatedBefore
    return filter
  }

  const isStep1Valid = form.name.trim().length > 0 && form.messageTemplate.trim().length > 0

  return {
    form, setField, nextStep, prevStep, setAudienceType,
    setFilterTags, setFilterDate, reset, buildAudienceFilter, isStep1Valid,
  }
}
