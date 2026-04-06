'use client'

import { useEffect, useState } from 'react'
import { Send } from 'lucide-react'

interface ChatMessage {
  id: string
  author: string
  message: string
  timestamp: string
}

interface ChatPanelProps {
  messages: ChatMessage[]
  streamId?: number | null
}

export function ChatPanel({ messages: initialMessages, streamId }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sendError, setSendError] = useState('')

  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  const handleSendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed) return

    setSendError('')

    const optimisticMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      author: 'You',
      message: trimmed,
      timestamp: 'now',
    }

    setMessages((current) => [...current, optimisticMessage])
    setInput('')

    if (!streamId) {
      return
    }

    try {
      const response = await fetch('/api/live/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streamId,
          authorName: 'You',
          message: trimmed,
        }),
      })

      const savedMessage = await response.json()

      if (!response.ok) {
        throw new Error(savedMessage.error ?? 'Failed to send message')
      }

      setMessages((current) =>
        current.map((message) =>
          message.id === optimisticMessage.id ? savedMessage : message
        )
      )
    } catch (error) {
      setMessages((current) => current.filter((message) => message.id !== optimisticMessage.id))
      setSendError(error instanceof Error ? error.message : 'Failed to send message')
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Live Chat</h3>
        <p className="text-sm text-muted-foreground">
          {messages.length} messages
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
              {msg.author.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-sm text-foreground">
                  {msg.author}
                </span>
                <span className="text-xs text-muted-foreground">
                  {msg.timestamp}
                </span>
              </div>
              <p className="text-sm text-foreground mt-1">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage()
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
          <button
            onClick={handleSendMessage}
            className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        {sendError && <p className="mt-2 text-xs text-red-500">{sendError}</p>}
      </div>
    </div>
  )
}
