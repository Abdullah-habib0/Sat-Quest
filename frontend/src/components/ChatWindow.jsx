import React, { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'

const SUGGESTIONS = [
  { icon: '🛰️', text: 'Detect objects in satellite imagery' },
  { icon: '✈️', text: 'Identify airplanes, ships, and vehicles' },
  { icon: '🏙️', text: 'Analyze urban areas and infrastructure' },
  { icon: '🌍', text: 'Answer questions about aerial images' },
]

const ChatWindow = ({ messages, isLoading, onSuggestionClick }) => {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="chat-messages">
      {messages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✦</div>
          <h2 className="empty-state-title">What can I help you with?</h2>
          <p className="empty-state-subtitle">
            Upload an image and ask anything about it
          </p>
          <div className="suggestion-chips">
            {SUGGESTIONS.map((s, i) => (
              <div
                key={i}
                className="chip"
                onClick={() => onSuggestionClick && onSuggestionClick(s.text)}
              >
                {s.icon} {s.text}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}
          {isLoading && (
            <div className="thinking-indicator">
              <div className="assistant-icon-sm">✦</div>
              <div className="thinking-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="thinking-text">Thinking...</span>
            </div>
          )}
        </>
      )}
      <div ref={bottomRef} />
    </div>
  )
}

export default ChatWindow
