import React, { useState } from 'react'
import { useChat } from './hooks/useChat'
import ChatWindow from './components/ChatWindow'
import QueryInput from './components/QueryInput'

// Get a short title from the first user message in a session
const getSessionTitle = (session) => {
  const messages = session.messages || []
  const firstUser = messages.find((m) => m.role === 'user')
  if (firstUser && firstUser.content) {
    const text = firstUser.content.trim()
    return text.length > 32 ? text.slice(0, 32) + '…' : text
  }
  return 'New conversation'
}

const formatDate = (isoString) => {
  if (!isoString) return ''
  try {
    const d = new Date(isoString)
    const now = new Date()
    const diffMs = now - d
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'yesterday'
    return d.toLocaleDateString()
  } catch {
    return ''
  }
}

const App = () => {
  const {
    messages,
    isLoading,
    error,
    sessionId,
    sessions,
    submitQuery,
    clearError,
    startNewChat,
    switchSession,
  } = useChat()

  const [imageFile, setImageFile] = useState(null)

  const handleSubmit = (query) => {
    submitQuery(query, imageFile)
    setImageFile(null)
  }

  const handleSuggestionClick = (text) => {
    submitQuery(text, null)
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">✦</span>
            <span className="logo-text">VLM Chat</span>
          </div>
          <button className="new-chat-btn" onClick={startNewChat}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Chat
          </button>
        </div>

        <div className="sidebar-sessions">
          {sessions.length === 0 ? (
            <p className="sessions-empty">No previous chats</p>
          ) : (
            <>
              <p className="sessions-label">Recent Chats</p>
              {sessions.map((s) => (
                <div
                  key={s.session_id}
                  className={`session-item ${s.session_id === sessionId ? 'active' : ''}`}
                  onClick={() => switchSession(s.session_id)}
                >
                  <div className="session-item-inner">
                    <span className="session-icon">💬</span>
                    <div className="session-meta">
                      <span className="session-title">{getSessionTitle(s)}</span>
                      {/* <span className="session-date">{formatDate(s.updated_at)}</span> */}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">U</div>
            <span className="user-label">User</span>
          </div>
        </div>
      </aside>

      {/* Main chat area */}
      <main className="chat-area">
        <div className="chat-header">
          <div className="chat-header-left">
            <span className="model-badge">
              <span className="model-dot"></span>
              Qwen2vl-2b-instruct-finetuned
            </span>
          </div>
          <div className="chat-header-right">
            <span className="session-chip">ID: {sessionId.slice(0, 8)}...</span>
          </div>
        </div>

        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSuggestionClick={handleSuggestionClick}
        />

        <div className="footer-wrapper">
          {error && (
            <div className="error-banner">
              <span>⚠ {error}</span>
              <button onClick={clearError}>✕</button>
            </div>
          )}
          <QueryInput
            onSubmit={handleSubmit}
            onImageSelect={(file) => setImageFile(file)}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  )
}

export default App