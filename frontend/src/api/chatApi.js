import axios from 'axios'

const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const sendMessage = async ({ sessionId, query, imageFile }) => {
  const formData = new FormData()

  formData.append('session_id', sessionId)
  formData.append('query', query)

  if (imageFile) {
    formData.append('image', imageFile)
  }

  const response = await axios.post(
    `${API_BASE}/api/chat`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  return response.data
}

export const getChatHistory = async (sessionId) => {
  const response = await axios.get(
    `${API_BASE}/api/history/${sessionId}`
  )

  return response.data.messages
}

export const getAllSessions = async () => {
  const response = await axios.get(
    `${API_BASE}/api/sessions`
  )

  return response.data.sessions
}
