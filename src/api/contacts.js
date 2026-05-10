import api from './axios.js'

export const getContacts = (params) =>
  api.get('/api/contacts', { params })

export const getPresignedUrl = (fileName) =>
  api.get('/api/uploads/presign', { params: { fileName } })

export const confirmUpload = (jobId, s3Key) =>
  api.post('/api/uploads/confirm', { jobId, s3Key })

export const getUploadJob = (jobId) =>
  api.get(`/api/uploads/${jobId}`)
