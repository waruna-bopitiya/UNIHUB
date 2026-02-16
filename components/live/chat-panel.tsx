'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

interface ChatMessage {
  id: string
  author: string
  message: string
  timestamp: string
}

interface ChatPanelProps {
  messages: ChatMessage[]
}

export function ChatPanel({ messages: initialMessages }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')

  const handleSendMessage = () => {
    if (!input.trim()) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      author: 'You',
      message: input,
      timestamp: 'now',
    }

    setMessages([...messages, newMessage])
    setInput('')
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
      </div>
    </div>
  )
}
