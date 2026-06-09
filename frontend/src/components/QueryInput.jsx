import React, { useState, useRef, useEffect } from 'react'

const QueryInput = ({ onSubmit, onImageSelect, isLoading }) => {
  const [query, setQuery] = useState('')
  const [previewUrl, setPreviewUrl] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
    }
  }, [query])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      onImageSelect(file)
    }
  }

  const clearImage = () => {
    setImageFile(null)
    setPreviewUrl(null)
    onImageSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = () => {
    if (!query.trim() || isLoading) return
    onSubmit(query)
    setQuery('')
    clearImage()
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="chat-input-area">
      <div className="input-container">
        {previewUrl && (
          <div className="image-preview-strip">
            <div className="image-preview-thumb">
              <img src={previewUrl} alt="preview" />
              <button className="remove-image-btn" onClick={clearImage}>✕</button>
            </div>
            <span className="image-filename">{imageFile?.name}</span>
          </div>
        )}

        <div className="input-row">
          <label className="upload-btn" htmlFor="image-upload" title="Attach image">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <input
              id="image-upload"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
          </label>

          <textarea
            ref={textareaRef}
            className="chat-textarea"
            placeholder="Message VLM Chat..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />

          <button
            className="send-btn"
            onClick={handleSubmit}
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? (
              <div className="send-spinner" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
              </svg>
            )}
          </button>
        </div>

        <p className="input-hint">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}

export default QueryInput