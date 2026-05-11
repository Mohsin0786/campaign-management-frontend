import api from './axios.js'

export const getCampaigns = (params) =>
  api.get('/api/campaigns', { params })

export const getCampaign = (id) =>
  api.get(`/api/campaigns/${id}`)

export const createCampaign = (data) =>
  api.post('/api/campaigns', data)

export const startCampaign = (id) =>
  api.post(`/api/campaigns/${id}/start`)

export const getCampaignAnalytics = (id) =>
  api.get(`/api/campaigns/${id}/analytics`)

export const deleteCampaign = (id) =>
  api.delete(`/api/campaigns/${id}`)
