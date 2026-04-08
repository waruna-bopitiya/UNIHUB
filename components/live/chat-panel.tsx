'use client'

import { useEffect, useState, useRef } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface ChatMessage {
  id: string
  author: string
  message: string
  timestamp: string
}

interface ChatPanelProps {
  messages: ChatMessage[]
  streamId?: number | null
  currentUserName?: string
  currentUserId?: string | null
}

export function ChatPanel({ 
  messages: initialMessages, 
  streamId,
  currentUserName = 'You',
  currentUserId 
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sendError, setSendError] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastMessageIdRef = useRef<string>('')

  // Fetch fresh messages
  const fetchMessages = async () => {
    if (!streamId) return

    try {
      const response = await fetch(`/api/live/messages?streamId=${streamId}&limit=100`, {
        cache: 'no-store',
      })

      if (!response.ok) return

      const data = await response.json()
      setMessages(Array.isArray(data) ? data : [])
      if (data.length > 0) {
        lastMessageIdRef.current = data[data.length - 1].id
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  // Initial load
  useEffect(() => {
    if (streamId) {
      setLoading(true)
      fetchMessages().finally(() => setLoading(false))
    }
  }, [streamId])

  // Set up polling for real-time updates
  useEffect(() => {
    if (!streamId) return

    // Poll every 2 seconds for new messages
    pollIntervalRef.current = setInterval(() => {
      fetchMessages()
    }, 2000)

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [streamId])

  const handleSendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed) return

    setSendError('')
    setSending(true)

    const optimisticMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      author: currentUserName,
      message: trimmed,
      timestamp: 'now',
    }

    setMessages((current) => [...current, optimisticMessage])
    setInput('')

    if (!streamId) {
      setSending(false)
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
          authorName: currentUserName,
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
    } finally {
      setSending(false)
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
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading chat...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex gap-2 animate-fadeIn">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                {msg.author.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className={`font-semibold text-sm ${msg.author === currentUserName ? 'text-primary' : 'text-foreground'}`}>
                    {msg.author === currentUserName ? `${msg.author} (You)` : msg.author}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {msg.timestamp}
                  </span>
                </div>
                <p className="text-sm text-foreground mt-1 break-words">{msg.message}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !sending) {
                handleSendMessage()
              }
            }}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={sending || !input.trim()}
            className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        {sendError && <p className="mt-2 text-xs text-red-500">{sendError}</p>}
      </div>
    </div>
  )
}
