'use client'

import React, { useEffect, useRef, useState } from 'react'
import hljs from 'highlight.js'

interface MarkdownProps {
  content: string
  isStreaming?: boolean
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const ref = useRef<HTMLElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (ref.current && !ref.current.dataset.highlighted) {
      hljs.highlightElement(ref.current)
    }
  }, [code])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-3 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ background: 'var(--code-header)', borderBottom: '1px solid var(--border)' }}
      >
        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          {lang || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-all duration-200"
          style={{
            color: copied ? '#10B981' : 'var(--text-secondary)',
            background: 'var(--bg-card)',
            border: `1px solid ${copied ? 'rgba(16,185,129,0.4)' : 'var(--border)'}`,
          }}
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Copied
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              Copy
            </>
          )}
        </button>
      </div>
      {/* Code */}
      <pre className="!m-0 !rounded-none !border-0 overflow-x-auto p-4 text-[0.82em]" style={{ background: 'var(--code-bg)' }}>
        <code ref={ref} className={lang ? `language-${lang}` : ''}>
          {code}
        </code>
      </pre>
    </div>
  )
}

export function MarkdownRenderer({ content, isStreaming }: MarkdownProps) {
  const parts = parseIntoParts(content)

  return (
    <div className="prose-chat text-sm leading-relaxed">
      {parts.map((part, i) => {
        if (part.type === 'code') {
          return <CodeBlock key={i} code={part.code!} lang={part.lang!} />
        }
        return (
          <div
            key={i}
            dangerouslySetInnerHTML={{ __html: part.html! }}
          />
        )
      })}
      {isStreaming && content.length > 0 && (
        <span className="streaming-cursor">▋</span>
      )}
    </div>
  )
}

type Part =
  | { type: 'html'; html: string }
  | { type: 'code'; code: string; lang: string }

function parseIntoParts(text: string): Part[] {
  const parts: Part[] = []
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g
  let lastIndex = 0
  let match

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Text before this code block
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index)
      const html = parseInlineMarkdown(before)
      if (html.trim()) parts.push({ type: 'html', html })
    }
    parts.push({ type: 'code', code: match[2].trim(), lang: match[1] || '' })
    lastIndex = match.index + match[0].length
  }

  // Remaining text after last code block
  if (lastIndex < text.length) {
    const rest = text.slice(lastIndex)
    const html = parseInlineMarkdown(rest)
    if (html.trim()) parts.push({ type: 'html', html })
  }

  return parts
}

function parseInlineMarkdown(text: string): string {
  let html = text

  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')

  html = html.replace(/^(\s*[-*+] .+(\n|$))+/gm, (match) => {
    const items = match.trim().split('\n').map(line => `<li>${line.replace(/^\s*[-*+] /, '')}</li>`)
    return `<ul>${items.join('')}</ul>`
  })

  html = html.replace(/^(\s*\d+\. .+(\n|$))+/gm, (match) => {
    const items = match.trim().split('\n').map(line => `<li>${line.replace(/^\s*\d+\. /, '')}</li>`)
    return `<ol>${items.join('')}</ol>`
  })

  html = html.replace(/^---$/gm, '<hr />')

  html = html.split('\n\n').map(para => {
    para = para.trim()
    if (!para) return ''
    if (para.match(/^<(h[1-3]|ul|ol|blockquote|hr)/)) return para
    return `<p>${para.replace(/\n/g, '<br />')}</p>`
  }).join('\n')

  return html
}
