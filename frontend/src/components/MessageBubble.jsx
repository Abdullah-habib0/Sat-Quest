import React from 'react'
import ReactMarkdown from 'react-markdown'

const MessageBubble = ({ message }) => {
  const { role, content, image_included, timestamp, imageUrl, imageFile } = message

  const formatTime = (ts) => {
    if (!ts) return ''
    try {
      const d = new Date(ts)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  if (role === 'user') {
    return (
      <div className="message-row user">
        <div className="message-content">
          {(image_included && (imageUrl || imageFile)) ? (
            <div className="image-preview-chat-msg">
              <img
                src={imageUrl || (typeof imageFile === 'string' ? imageFile : undefined)}
                alt="Uploaded"
                style={{ maxWidth: '200px', borderRadius: '8px', marginBottom: '8px' }}
              />
            </div>
          ) : image_included && (
            <span className="image-badge">📷 Image attached</span>
          )}
          <div className="message-bubble user-bubble">
            <p>{content}</p>
          </div>
          <span className="message-time">{formatTime(timestamp)}</span>
        </div>
        <div className="message-avatar user-avatar-msg">U</div>
      </div>
    )
  }

  return (
    <div className="message-row assistant">
      <div className="assistant-icon">✦</div>
      <div className="message-content">
        <span className="assistant-name">VLM Chat</span>
        <div className="message-bubble assistant-bubble">
          <ReactMarkdown className="markdown-body">{content}</ReactMarkdown>
        </div>
        <span className="message-time">{formatTime(timestamp)}</span>
      </div>
    </div>
  )
}

export default MessageBubble