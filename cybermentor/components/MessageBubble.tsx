'use client'

import { useState } from 'react'
import { Copy, Check, User, Shield, RefreshCw } from 'lucide-react'
import { MarkdownRenderer } from './MarkdownRenderer'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
  isLast?: boolean
  onRegenerate?: () => void
}

export function MessageBubble({ message, isStreaming, isLast, onRegenerate }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const time = message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

  if (isUser) {
    return (
      <div className="flex justify-end gap-3">
        <div className="flex flex-col items-end max-w-[75%]">
          <span className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{time}</span>
          <div className="text-white text-sm rounded-xl rounded-tr-sm px-4 py-3 leading-relaxed" style={{ background: 'var(--brand)' }}>
            {message.content}
          </div>
        </div>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center mt-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <User size={14} style={{ color: 'var(--text-secondary)' }} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center mt-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <Shield size={14} style={{ color: 'var(--brand)' }} />
      </div>
      <div className="flex flex-col max-w-[80%] min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>CyberMentor</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{time}</span>
        </div>
        <div className="rounded-xl rounded-tl-sm px-4 py-3 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <MarkdownRenderer content={message.content} isStreaming={isStreaming} />
          {!isStreaming && (
            <div className="flex items-center justify-between mt-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <div>
                {isLast && onRegenerate && (
                  <button onClick={onRegenerate} className="flex items-center gap-1.5 text-xs transition-colors duration-200" style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
                  >
                    <RefreshCw size={11} /><span>Regenerate</span>
                  </button>
                )}
              </div>
              <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs transition-colors duration-200" style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
              >
                {copied ? <><Check size={11} /><span>Copied</span></> : <><Copy size={11} /><span>Copy</span></>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <Shield size={14} style={{ color: 'var(--brand)' }} />
      </div>
      <div className="flex flex-col mt-1">
        <span className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>CyberMentor</span>
        <div className="rounded-xl rounded-tl-sm px-4 py-3 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-muted)', animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-muted)', animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-muted)', animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
