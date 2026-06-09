import { useState, useCallback, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { sendMessage, getChatHistory, getAllSessions } from '../api/chatApi'

export const useChat = () => {
  const [sessionId, setSessionId] = useState(() => uuidv4())
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sessions, setSessions] = useState([])

  // Load all past sessions on mount
  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const data = await getAllSessions()
      // Sort by updated_at descending (most recent first)
      const sorted = data.sort(
        (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
      )
      setSessions(sorted)
    } catch (err) {
      console.error('Failed to load sessions:', err)
    }
  }

  const switchSession = useCallback(async (sid) => {
    setSessionId(sid)
    try {
      const msgs = await getChatHistory(sid)
      setMessages(msgs)
    } catch (err) {
      setError('Failed to load session.')
    }
  }, [])

  const startNewChat = useCallback(() => {
    const newId = uuidv4()
    setSessionId(newId)
    setMessages([])
    setError(null)
  }, [])

  const submitQuery = useCallback(
    async (query, imageFile) => {
      if (!query.trim()) return

      setIsLoading(true)
      setError(null)

      // Optimistic user message with image preview
      let imageUrl = null
      if (imageFile) {
        imageUrl = URL.createObjectURL(imageFile)
      }
      setMessages((prev) => [
        ...prev,
        {
          role: 'user',
          content: query,
          image_included: imageFile !== null && imageFile !== undefined,
          imageUrl,
          imageFile: imageUrl, // for compatibility
          timestamp: new Date().toISOString(),
        },
      ])

      try {
        const response = await sendMessage({ sessionId, query, imageFile })
        setMessages((prev) => {
          // Find the last user message with imageUrl
          const lastUserMsgWithImage = [...prev].reverse().find(
            (msg) => msg.role === 'user' && msg.imageUrl
          )
          // Merge imageUrl into the corresponding user message from backend
          const newMessages = response.messages.map((msg) => {
            if (
              msg.role === 'user' &&
              msg.image_included &&
              lastUserMsgWithImage &&
              msg.content === lastUserMsgWithImage.content &&
              Math.abs(new Date(msg.timestamp) - new Date(lastUserMsgWithImage.timestamp)) < 60000 // 1 min
            ) {
              return { ...msg, imageUrl: lastUserMsgWithImage.imageUrl, imageFile: lastUserMsgWithImage.imageFile }
            }
            return msg
          })
          return newMessages
        })
        // Refresh sidebar sessions after each message
        await loadSessions()
      } catch (err) {
        setError('Something went wrong. Please try again.')
        setMessages((prev) => prev.slice(0, -1))
      } finally {
        setIsLoading(false)
      }
    },
    [sessionId]
  )

  const clearError = useCallback(() => setError(null), [])

  return {
    messages,
    isLoading,
    error,
    sessionId,
    sessions,
    submitQuery,
    clearError,
    startNewChat,
    switchSession,
  }
}