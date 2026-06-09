import axios from 'axios'

export const sendMessage = async ({ sessionId, query, imageFile }) => {
  const formData = new FormData()
  formData.append('session_id', sessionId)
  formData.append('query', query)
  if (imageFile) {
    formData.append('image', imageFile)
  }
  const response = await axios.post('/api/chat', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const getChatHistory = async (sessionId) => {
  const response = await axios.get(`/api/history/${sessionId}`)
  return response.data.messages
}

export const getAllSessions = async () => {
  const response = await axios.get('/api/sessions')
  return response.data.sessions
}