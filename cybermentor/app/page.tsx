'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Trash2, Shield, Bug, Globe, Zap, ChevronRight, AlertTriangle, Square, ArrowDown, Moon, Sun } from 'lucide-react'
import { MessageBubble, TypingIndicator, type Message } from '@/components/MessageBubble'
import { useTheme } from '@/components/ThemeProvider'

const SUGGESTED_PROMPTS = [
  { icon: <Bug size={15} />, label: 'SQL Injection', prompt: 'What is SQL Injection? Show me a real-world example.' },
  { icon: <Globe size={15} />, label: 'XSS Attacks', prompt: 'Explain Cross-Site Scripting (XSS) attacks with a practical example.' },
  { icon: <Zap size={15} />, label: 'API Exploitation', prompt: 'How do hackers exploit APIs? What are the top attack vectors?' },
]

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingId, setStreamingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const { theme, toggle } = useTheme()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (autoScroll) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, autoScroll])

  const handleScroll = () => {
    const el = chatContainerRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    setAutoScroll(atBottom)
    setShowScrollBtn(!atBottom)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setAutoScroll(true)
    setShowScrollBtn(false)
  }

  const runStream = useCallback(async (history: { role: string; content: string }[], assistantId: string) => {
    const controller = new AbortController()
    abortControllerRef.current = controller
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Request failed')
      }
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const token = decoder.decode(value, { stream: true })
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content + token } : m))
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsLoading(false)
      setStreamingId(null)
      abortControllerRef.current = null
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    const trimmed = content.trim()
    if (!trimmed || isLoading) return
    setError(null)
    setAutoScroll(true)
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: trimmed, timestamp: new Date() }
    const assistantId = crypto.randomUUID()
    const assistantMessage: Message = { id: assistantId, role: 'assistant', content: '', timestamp: new Date() }
    setMessages(prev => [...prev, userMessage, assistantMessage])
    setInput('')
    setIsLoading(true)
    setStreamingId(assistantId)
    const history = [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
    await runStream(history, assistantId)
  }, [messages, isLoading, runStream])

  const stopGeneration = () => abortControllerRef.current?.abort()

  const regenerate = useCallback(async () => {
    const lastUserIdx = [...messages].reverse().findIndex(m => m.role === 'user')
    if (lastUserIdx === -1) return
    const trimmed = messages.slice(0, messages.length - 1)
    const assistantId = crypto.randomUUID()
    setMessages([...trimmed, { id: assistantId, role: 'assistant', content: '', timestamp: new Date() }])
    setError(null)
    setAutoScroll(true)
    setIsLoading(true)
    setStreamingId(assistantId)
    await runStream(trimmed.map(m => ({ role: m.role, content: m.content })), assistantId)
  }, [messages, runStream])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  const clearChat = () => {
    abortControllerRef.current?.abort()
    setMessages([])
    setError(null)
    setIsLoading(false)
    setStreamingId(null)
    inputRef.current?.focus()
  }

  const isEmpty = messages.length === 0
  const lastMsg = messages[messages.length - 1]

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

      {/* HEADER */}
      <header className="flex-shrink-0 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)' }}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand)' }}>
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>CyberMentor AI</h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Learn cybersecurity through real-world scenarios</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Online</span>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-transparent transition-all duration-200"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'
                }}
              >
                <Trash2 size={12} />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CHAT AREA */}
      <div ref={chatContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto relative">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">

          {isEmpty && (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
              <div className="w-12 h-12 rounded-xl border flex items-center justify-center mb-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <Shield size={22} style={{ color: 'var(--brand)' }} />
              </div>
              <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Ready to learn?</h2>
              <p className="text-sm max-w-sm mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Ask anything about cybersecurity — attacks, defenses, tools, or CTF challenges.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
                {SUGGESTED_PROMPTS.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => sendMessage(item.prompt)}
                    className="group text-left p-4 rounded-xl border transition-all duration-200"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--brand)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--brand)' }}>
                      {item.icon}
                      <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.prompt}</p>
                    <ChevronRight size={12} className="mt-2" style={{ color: 'var(--text-muted)' }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, i) => {
            if (message.role === 'assistant' && message.content === '') return null
            return (
              <MessageBubble
                key={message.id}
                message={message}
                isStreaming={message.id === streamingId}
                isLast={i === messages.length - 1 && message.role === 'assistant' && !isLoading}
                onRegenerate={regenerate}
              />
            )
          })}

          {isLoading && lastMsg?.role === 'assistant' && lastMsg.content === '' && <TypingIndicator />}

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
              <AlertTriangle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {showScrollBtn && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs rounded-full px-4 py-2 shadow-lg transition-all duration-200 z-10 border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <ArrowDown size={12} />
            Scroll to bottom
          </button>
        )}
      </div>

      {/* INPUT AREA */}
      <div className="flex-shrink-0 border-t px-6 py-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end rounded-lg px-4 py-3 border transition-colors duration-200" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => {
                setInput(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask about an attack, tool, or technique..."
              rows={1}
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm resize-none outline-none leading-relaxed disabled:opacity-50 min-h-[24px] max-h-[160px]"
              style={{ color: 'var(--text-primary)', caretColor: 'var(--brand)' }}
            />
            {isLoading ? (
              <button
                onClick={stopGeneration}
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 border"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                title="Stop generation"
              >
                <Square size={13} fill="currentColor" />
              </button>
            ) : (
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'var(--brand)' }}
              >
                <Send size={14} className="text-white" />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <kbd className="rounded px-1 py-0.5 text-[10px] border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>↵</kbd> send &nbsp;·&nbsp;
              <kbd className="rounded px-1 py-0.5 text-[10px] border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>Shift+↵</kbd> newline
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>powered by gemma-3-12b</p>
          </div>
        </div>
      </div>
    </div>
  )
}
