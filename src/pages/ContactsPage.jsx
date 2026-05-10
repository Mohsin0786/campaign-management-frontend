import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useContactFilters } from '../hooks/useContactFilters.js'
import { getContacts } from '../api/contacts.js'
import ContactFilters from '../components/contacts/ContactFilters.jsx'
import ContactTable from '../components/contacts/ContactTable.jsx'
import UploadModal from '../components/contacts/UploadModal.jsx'
import Pagination from '../components/shared/Pagination.jsx'
import LoadingSpinner from '../components/shared/LoadingSpinner.jsx'

export default function ContactsPage() {
  const [uploadOpen, setUploadOpen] = useState(false)
  const { filters, queryParams, setSearch, setTags, setDate, nextPage, prevPage, reset, TAGS } = useContactFilters()

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['contacts', queryParams],
    queryFn:  () => getContacts(queryParams),
    keepPreviousData: true,
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.count !== undefined && !isLoading
              ? `Showing ${data.count} contacts`
              : 'Manage your contact database'
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isFetching && !isLoading && <LoadingSpinner size="sm" />}
          <button onClick={() => setUploadOpen(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <ContactFilters
        filters={filters}
        setSearch={setSearch}
        setTags={setTags}
        setDate={setDate}
        reset={reset}
        TAGS={TAGS}
      />

      {/* Empty state */}
      {!isLoading && !isError && data?.data?.length === 0 && (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">No contacts yet</h3>
          <p className="text-gray-500 text-sm mb-4">Import a CSV file to get started</p>
          <button onClick={() => setUploadOpen(true)} className="btn-primary mx-auto">
            Import CSV
          </button>
        </div>
      )}

      {/* Table */}
      {(isLoading || data?.data?.length > 0) && (
        <ContactTable contacts={data?.data} isLoading={isLoading} isError={isError} />
      )}

      {/* Pagination */}
      {data?.data?.length > 0 && (
        <Pagination
          onNext={() => nextPage(data.nextCursor)}
          onPrev={prevPage}
          hasNext={data.hasNextPage}
          hasPrev={filters.cursorHistory?.length > 0}
          isLoading={isFetching}
        />
      )}

      <UploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  )
}
