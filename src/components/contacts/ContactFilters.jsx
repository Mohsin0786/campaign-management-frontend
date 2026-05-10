import { useState, useEffect } from 'react'

export default function ContactFilters({ filters, setSearch, setTags, setDate, reset, TAGS }) {
  const [searchInput, setSearchInput] = useState(filters.search)

  // Debounce search 300ms
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(t)
  }, [searchInput, setSearch])

  const toggleTag = (tag) => {
    const next = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag]
    setTags(next)
  }

  const hasFilters = filters.search || filters.tags.length || filters.createdAfter || filters.createdBefore

  return (
    <div className="card p-4 space-y-4">
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="flex-1 min-w-48">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="input pl-9"
            />
          </div>
        </div>

        {/* Date range */}
        <div className="flex gap-2">
          <input
            type="date"
            value={filters.createdAfter}
            onChange={e => setDate({ createdAfter: e.target.value })}
            className="input w-40"
            placeholder="From"
          />
          <input
            type="date"
            value={filters.createdBefore}
            onChange={e => setDate({ createdBefore: e.target.value })}
            className="input w-40"
            placeholder="To"
          />
        </div>

        {hasFilters && (
          <button onClick={reset} className="btn-secondary text-xs">
            Clear filters
          </button>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
              filters.tags.includes(tag)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}
