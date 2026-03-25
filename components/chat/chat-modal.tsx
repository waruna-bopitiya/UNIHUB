'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Search, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ChatMessage {
  id: string
  sender: string
  senderAvatar: string
  content: string
  timestamp: string
  isOwn: boolean
}

interface ChatConversation {
  id: string
  name: string
  avatar: string
  lastMessage: string
  unread: number
  messages: ChatMessage[]
}

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
}

const mockConversations: ChatConversation[] = [
  {
    id: '1',
    name: 'Alex Kumar',
    avatar: 'A',
    lastMessage: 'That sounds great! 👍',
    unread: 2,
    messages: [
      {
        id: '1',
        sender: 'Alex Kumar',
        senderAvatar: 'A',
        content: 'Hey! How are you doing?',
        timestamp: '10:30 AM',
        isOwn: false,
      },
      {
        id: '2',
        sender: 'You',
        senderAvatar: 'Y',
        content: 'I am doing great! Just finished the assignment',
        timestamp: '10:35 AM',
        isOwn: true,
      },
      {
        id: '3',
        sender: 'Alex Kumar',
        senderAvatar: 'A',
        content: 'That sounds great! 👍',
        timestamp: '10:37 AM',
        isOwn: false,
      },
    ],
  },
  {
    id: '2',
    name: 'Sarah Chen',
    avatar: 'S',
    lastMessage: 'See you in class!',
    unread: 0,
    messages: [
      {
        id: '1',
        sender: 'Sarah Chen',
        senderAvatar: 'S',
        content: 'Did you understand the last lecture?',
        timestamp: '2:15 PM',
        isOwn: false,
      },
      {
        id: '2',
        sender: 'You',
        senderAvatar: 'Y',
        content: 'Not completely, need to review it',
        timestamp: '2:20 PM',
        isOwn: true,
      },
      {
        id: '3',
        sender: 'Sarah Chen',
        senderAvatar: 'S',
        content: 'See you in class!',
        timestamp: '2:25 PM',
        isOwn: false,
      },
    ],
  },
  {
    id: '3',
    name: 'James Wilson',
    avatar: 'J',
    lastMessage: 'Thanks for the help!',
    unread: 0,
    messages: [
      {
        id: '1',
        sender: 'James Wilson',
        senderAvatar: 'J',
        content: 'Can you send me the notes?',
        timestamp: '9:45 AM',
        isOwn: false,
      },
      {
        id: '2',
        sender: 'You',
        senderAvatar: 'Y',
        content: 'Sure! Check your email',
        timestamp: '9:50 AM',
        isOwn: true,
      },
      {
        id: '3',
        sender: 'James Wilson',
        senderAvatar: 'J',
        content: 'Thanks for the help!',
        timestamp: '9:55 AM',
        isOwn: false,
      },
    ],
  },
]

export function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(mockConversations[0])
  const [newMessage, setNewMessage] = useState('')
  const [conversations, setConversations] = useState<ChatConversation[]>(mockConversations)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Resizable state
  const [width, setWidth] = useState(800) // increased default width
  const [height, setHeight] = useState(600)
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [cursor, setCursor] = useState('default')

  // Handle resize mouse down
  const handleResizeStart = (position: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(position)
  }

  // Handle resize mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !modalRef.current) return

      const rect = modalRef.current.getBoundingClientRect()
      const handleSize = 8 // pixels for resize handle

      if (isResizing === 'bottom') {
        const newHeight = Math.max(400, window.innerHeight - e.clientY)
        setHeight(newHeight)
      } else if (isResizing === 'right') {
        const newWidth = Math.max(320, e.clientX - rect.left)
        setWidth(newWidth)
      } else if (isResizing === 'corner') {
        const newWidth = Math.max(320, e.clientX - rect.left)
        const newHeight = Math.max(400, window.innerHeight - e.clientY)
        setWidth(newWidth)
        setHeight(newHeight)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(null)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isResizing])

  // Handle cursor change for resize hints
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!modalRef.current || isResizing) return

      const rect = modalRef.current.getBoundingClientRect()
      const handleSize = 10

      const isNearBottom = e.clientY >= rect.bottom - handleSize && e.clientY <= rect.bottom + 5
      const isNearRight = e.clientX >= rect.right - handleSize && e.clientX <= rect.right + 5
      const isNearCorner = isNearBottom && isNearRight

      if (isNearCorner) {
        setCursor('nwse-resize')
      } else if (isNearBottom) {
        setCursor('ns-resize')
      } else if (isNearRight) {
        setCursor('ew-resize')
      } else {
        setCursor('default')
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isResizing])

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const updatedConversations = conversations.map((conv) => {
      if (conv.id === selectedConversation.id) {
        const newMsg: ChatMessage = {
          id: Date.now().toString(),
          sender: 'You',
          senderAvatar: 'Y',
          content: newMessage,
          timestamp: new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          isOwn: true,
        }
        return {
          ...conv,
          messages: [...conv.messages, newMsg],
          lastMessage: newMessage,
        }
      }
      return conv
    })

    setConversations(updatedConversations)
    setSelectedConversation(updatedConversations.find((c) => c.id === selectedConversation.id) || null)
    setNewMessage('')
  }

  if (!isOpen) return null

  return (
    <div 
      ref={modalRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        cursor: cursor,
      }}
      className="fixed bottom-0 right-0 bg-background border border-border shadow-2xl flex flex-col z-50 rounded-t-lg transition-cursor overflow-hidden
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-primary/5">
        <div>
          <h2 className="font-bold text-foreground 
            /* Mobile */
            text-base
            /* Tablet and up */
            sm:text-lg
            /* Desktop */
            lg:text-xl
          ">Messages</h2>
          <p className="text-xs text-muted-foreground mt-1">Chat with students</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Conversations List */}
        <div className="
          /* Mobile - hidden by default, can be toggled */
          hidden
          /* Tablet and up - show as sidebar */
          sm:flex sm:w-1/3 sm:border-r
          lg:w-2/5 
          xl:w-1/3
          border-border flex-col
        ">
          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* New Chat Button */}
          <div className="p-3 border-b border-border">
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-xs sm:text-sm font-medium">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full px-4 py-3 border-b border-border text-left transition-colors hover:bg-secondary ${
                  selectedConversation?.id === conv.id ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm flex-shrink-0">
                    {conv.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-xs sm:text-sm text-foreground truncate">
                        {conv.name}
                      </p>
                      {conv.unread > 0 && (
                        <span className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5 flex-shrink-0">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConversation && (
          <div className="flex-1 flex flex-col w-full sm:w-2/3 lg:w-3/5 xl:w-2/3">
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-primary/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center">
                {selectedConversation.avatar}
              </div>
              <div>
                <p className="font-medium text-foreground text-sm sm:text-base">{selectedConversation.name}</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto 
              /* Mobile */
              p-3 space-y-2
              /* Tablet and up */
              sm:p-4 sm:space-y-3
            ">
              {selectedConversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  {!msg.isOwn && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs mr-2 flex-shrink-0">
                      {msg.senderAvatar}
                    </div>
                  )}
                  <div
                    className={`
                      /* Mobile */
                      max-w-[70%]
                      /* Tablet and up */
                      sm:max-w-xs
                      px-3 py-2 rounded-lg text-sm ${
                      msg.isOwn
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-secondary text-secondary-foreground rounded-bl-none'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      msg.isOwn 
                        ? 'text-primary-foreground/70' 
                        : 'text-secondary-foreground/70'
                    }`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="
              /* Mobile */
              p-3 border-t border-border bg-background
              /* Tablet and up */
              sm:p-4
            ">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage()
                    }
                  }}
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  size="sm"
                  className="px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resize Handles */}
      {/* Bottom Resize Handle */}
      <div
        onMouseDown={handleResizeStart('bottom')}
        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-primary/30 transition-colors z-50"
        title="Drag to resize height"
      />

      {/* Right Resize Handle */}
      <div
        onMouseDown={handleResizeStart('right')}
        className="absolute top-0 bottom-0 right-0 w-2 cursor-ew-resize hover:bg-primary/30 transition-colors z-50"
        title="Drag to resize width"
      />

      {/* Corner Resize Handle */}
      <div
        onMouseDown={handleResizeStart('corner')}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize hover:bg-primary/50 transition-colors z-50 rounded-tl-sm"
        title="Drag to resize both dimensions"
      />
    </div>
  )
}
