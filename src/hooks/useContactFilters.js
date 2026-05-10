import { useReducer, useCallback } from 'react'

const TAGS = ['vip', 'enterprise', 'trial', 'churned', 'active', 'newsletter', 'premium', 'basic']

const initialState = {
  search: '',
  tags: [],
  createdAfter: '',
  createdBefore: '',
  cursor: null,
  cursorHistory: [], // stack of previous cursors for Prev button
  limit: 20,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SEARCH':
      return { ...state, search: action.payload, cursor: null, cursorHistory: [] }
    case 'SET_TAGS':
      return { ...state, tags: action.payload, cursor: null, cursorHistory: [] }
    case 'SET_DATE':
      return { ...state, ...action.payload, cursor: null, cursorHistory: [] }
    case 'NEXT_PAGE':
      return {
        ...state,
        cursorHistory: [...state.cursorHistory, state.cursor],
        cursor: action.payload,
      }
    case 'PREV_PAGE': {
      const history = [...state.cursorHistory]
      const prev = history.pop()
      return { ...state, cursor: prev || null, cursorHistory: history }
    }
    case 'RESET':
      return { ...initialState }
    default:
      return state
  }
}

export function useContactFilters() {
  const [filters, dispatch] = useReducer(reducer, initialState)

  const setSearch    = useCallback((v) => dispatch({ type: 'SET_SEARCH', payload: v }), [])
  const setTags      = useCallback((v) => dispatch({ type: 'SET_TAGS', payload: v }), [])
  const setDate      = useCallback((v) => dispatch({ type: 'SET_DATE', payload: v }), [])
  const nextPage     = useCallback((cursor) => dispatch({ type: 'NEXT_PAGE', payload: cursor }), [])
  const prevPage     = useCallback(() => dispatch({ type: 'PREV_PAGE' }), [])
  const reset        = useCallback(() => dispatch({ type: 'RESET' }), [])

  // Build query params — exclude empty values
  const queryParams = {
    ...(filters.search       && { search: filters.search }),
    ...(filters.tags.length  && { tags: filters.tags.join(',') }),
    ...(filters.createdAfter && { createdAfter: filters.createdAfter }),
    ...(filters.createdBefore && { createdBefore: filters.createdBefore }),
    ...(filters.cursor       && { cursor: filters.cursor }),
    limit: filters.limit,
  }

  return { filters, queryParams, setSearch, setTags, setDate, nextPage, prevPage, reset, TAGS }
}
