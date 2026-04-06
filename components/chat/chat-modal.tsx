'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Search, Plus, Trash2 } from 'lucide-react'
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
  lastLogin?: string
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
    unread: 0,
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
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewChatForm, setShowNewChatForm] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [loadingChats, setLoadingChats] = useState(true)
  
  // User suggestions state
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  
  // Resizable state
  const [width, setWidth] = useState(800) // increased default width
  const [height, setHeight] = useState(600)
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [cursor, setCursor] = useState('default')

  // Load user ID and fetch chats on mount
  useEffect(() => {
    const loadChats = async () => {
      try {
        const storedUserId = localStorage.getItem('studentId')
        if (!storedUserId) {
          console.log('⚠️ No user ID found - using mock data')
          setConversations(mockConversations)
          setSelectedConversation(mockConversations[0])
          setLoadingChats(false)
          return
        }

        setUserId(storedUserId)
        console.log('👤 Fetching chats for user:', storedUserId)

        const response = await fetch(`/api/chat?userId=${storedUserId}`)
        const result = await response.json()

        if (result.status === 'success' && Array.isArray(result.data)) {
          console.log('✅ Chats loaded from database:', result.data.length, 'chats')
          setConversations(result.data)
          if (result.data.length > 0) {
            setSelectedConversation(result.data[0])
          }
        } else {
          console.log('⚠️ No chats found, using mock data')
          setConversations(mockConversations)
          setSelectedConversation(mockConversations[0])
        }
      } catch (error) {
        console.error('❌ Error loading chats:', error)
        setConversations(mockConversations)
        setSelectedConversation(mockConversations[0])
      } finally {
        setLoadingChats(false)
      }
    }

    if (isOpen) {
      loadChats()
    }
  }, [isOpen])

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

  // Handle member name input and fetch suggestions
  const handleMemberNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewMemberName(value)

    if (value.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      setSelectedUser(null)
      return
    }

    try {
      console.log('🔍 Fetching suggestions for:', value)
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(value)}&limit=8`)
      const result = await response.json()

      if (result.status === 'success' && Array.isArray(result.data)) {
        console.log('✅ Got', result.data.length, 'suggestions')
        setSuggestions(result.data)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error('❌ Error fetching suggestions:', error)
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSelectUser = (user: any) => {
    console.log('👤 Selected user:', user.fullName)
    setSelectedUser(user)
    setNewMemberName(user.fullName)
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !userId) return

    try {
      console.log('💬 Sending message to chat:', selectedConversation.id)

      // Save message to backend
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: parseInt(selectedConversation.id),
          sender: 'You',
          senderAvatar: 'Y',
          content: newMessage,
          isOwn: true,
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ Failed to send message:', result.message)
        return
      }

      console.log('✅ Message sent successfully')

      // Update frontend state
      const updatedConversations = conversations.map((conv) => {
        if (conv.id === selectedConversation.id) {
          return {
            ...conv,
            messages: [...conv.messages, result.data],
            lastMessage: newMessage,
          }
        }
        return conv
      })

      setConversations(updatedConversations)
      setSelectedConversation(updatedConversations.find((c) => c.id === selectedConversation.id) || null)
      setNewMessage('')
    } catch (error) {
      console.error('❌ Error sending message:', error)
    }
  }

  const handleCreateNewChat = async () => {
    if (!newMemberName.trim() || !userId) return

    try {
      const displayName = selectedUser?.fullName || newMemberName
      console.log('💾 Creating new chat with participant:', displayName)

      // Save chat to backend
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          participantName: displayName,
          participantId: selectedUser?.id || null,
        })
      })

      const apiResult = await response.json()

      if (!response.ok) {
        console.error('❌ Failed to create chat:', apiResult.message)
        alert('Error creating chat: ' + apiResult.message)
        return
      }

      console.log('✅ Chat created successfully:', apiResult.data)

      // Add to frontend state
      const updatedConversations = [apiResult.data, ...conversations]
      setConversations(updatedConversations)
      setSelectedConversation(apiResult.data)
      setNewMemberName('')
      setSelectedUser(null)
      setSuggestions([])
      setShowSuggestions(false)
      setShowNewChatForm(false)
    } catch (error) {
      console.error('❌ Error creating chat:', error)
      alert('Failed to create chat. Check console for details.')
    }
  }

  const handleSelectConversation = async (conv: ChatConversation) => {
    console.log('👤 Selected conversation:', conv.id, 'with', conv.unread, 'unread messages')
    
    // Set the selected conversation
    setSelectedConversation(conv)

    // If there are unread messages, mark them as read
    if (conv.unread > 0) {
      try {
        console.log('📖 Marking messages as read for chat:', conv.id)
        const response = await fetch('/api/chat/messages/mark-read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId: conv.id }),
        })

        const result = await response.json()

        if (result.status === 'success') {
          console.log('✅ Marked', result.data.markedCount, 'messages as read')

          // Update the conversation to reflect zero unread
          const updatedConversations = conversations.map((c) => {
            if (c.id === conv.id) {
              return { ...c, unread: 0 }
            }
            return c
          })

          setConversations(updatedConversations)
        }
      } catch (error) {
        console.error('❌ Error marking messages as read:', error)
      }
    }
  }

  const handleDeleteChat = async () => {
    console.log('🗑️ handleDeleteChat called')
    
    if (!selectedConversation) {
      console.error('❌ No selected conversation')
      alert('No chat selected')
      return
    }
    
    if (!confirm('Are you sure you want to delete this entire chat? This cannot be undone.')) {
      console.log('User cancelled deletion')
      return
    }

    try {
      console.log('🔍 Chat to delete ID:', selectedConversation.id, 'type:', typeof selectedConversation.id)
      
      // Ensure chatId is a valid number
      const id = parseInt(selectedConversation.id, 10)
      if (isNaN(id) || id <= 0) {
        console.error('❌ Invalid chat ID:', selectedConversation.id, '-> parsed:', id)
        alert('Invalid chat ID: ' + selectedConversation.id)
        return
      }

      console.log('📤 Sending DELETE request to /api/chat/' + id)

      const response = await fetch(`/api/chat/${id}`, {
        method: 'DELETE',
      })

      console.log('📥 Response status:', response.status, 'ok:', response.ok)

      const result = await response.json()
      console.log('📋 Response data:', result)

      if (!response.ok) {
        console.error('❌ HTTP Error:', response.status, result.message)
        alert('Error: ' + result.message)
        return
      }

      console.log('✅ Chat deleted successfully from database')

      // Remove from frontend state
      const chatIdStr = selectedConversation.id.toString()
      const updatedConversations = conversations.filter((c) => {
        const convIdStr = c.id.toString()
        const shouldKeep = convIdStr !== chatIdStr
        if (!shouldKeep) {
          console.log('🎯 Removing chat:', c.id, 'name:', c.name)
        }
        return shouldKeep
      })
      console.log('After filter - remaining conversations:', updatedConversations.length)
      setConversations(updatedConversations)
      setSelectedConversation(updatedConversations.length > 0 ? updatedConversations[0] : null)
      console.log('✅ UI updated successfully')
    } catch (error) {
      console.error('❌ Exception during delete:', error)
      alert('Failed to delete chat: ' + String(error))
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    console.log('🗑️ handleDeleteMessage called with:', messageId, 'type:', typeof messageId)
    
    if (!selectedConversation) {
      console.error('❌ No selected conversation')
      alert('No chat selected')
      return
    }
    
    if (!confirm('Are you sure you want to delete this message? This cannot be undone.')) {
      console.log('User cancelled deletion')
      return
    }

    try {
      console.log('🔍 Message to delete ID:', messageId)
      
      // Ensure messageId is a valid number
      const id = parseInt(messageId, 10)
      if (isNaN(id) || id <= 0) {
        console.error('❌ Invalid message ID:', messageId, '-> parsed:', id)
        alert('Invalid message ID: ' + messageId)
        return
      }

      console.log('📤 Sending DELETE request to /api/chat/messages/' + id)
      
      const response = await fetch(`/api/chat/messages/${id}`, {
        method: 'DELETE',
      })

      console.log('📥 Response status:', response.status, 'ok:', response.ok)

      const result = await response.json()
      console.log('📋 Response data:', result)

      if (!response.ok) {
        console.error('❌ HTTP Error:', response.status, result.message)
        alert('Error: ' + result.message)
        return
      }

      console.log('✅ Message deleted successfully from database')
      console.log('📊 Updating UI for conversation:', selectedConversation.id)

      // Remove from frontend state using numeric comparison
      const updatedConversations = conversations.map((conv) => {
        if (conv.id === selectedConversation.id) {
          console.log('Found matching conversation')
          console.log('Before filter - total messages:', conv.messages.length)
          
          const messageIdNum = parseInt(messageId, 10)
          const newMessages = conv.messages.filter((m) => {
            const msgIdNum = parseInt(m.id, 10)
            const shouldKeep = msgIdNum !== messageIdNum
            
            if (msgIdNum === messageIdNum) {
              console.log('🎯 DELETING message ID:', m.id)
            }
            return shouldKeep
          })
          
          console.log('After filter - total messages:', newMessages.length)
          console.log('Deleted count:', conv.messages.length - newMessages.length)
          
          return {
            ...conv,
            messages: newMessages,
            lastMessage: newMessages.length > 0 ? newMessages[newMessages.length - 1].content : 'No messages yet',
          }
        }
        return conv
      })

      console.log('🔄 Setting updated conversations')
      setConversations(updatedConversations)
      
      const updated = updatedConversations.find((c) => c.id === selectedConversation.id)
      setSelectedConversation(updated || null)
      console.log('✅ UI updated successfully')
    } catch (error) {
      console.error('❌ Exception during delete:', error)
      alert('Failed to delete message: ' + String(error))
    }
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
            {!showNewChatForm ? (
              <button 
                onClick={() => setShowNewChatForm(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-xs sm:text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Chat</span>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter member name or email..."
                    value={newMemberName}
                    onChange={handleMemberNameChange}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateNewChat()
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs sm:text-sm"
                    autoFocus
                  />
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                      {suggestions.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleSelectUser(user)}
                          className="w-full px-3 py-2 text-left hover:bg-primary/10 transition-colors border-b border-border last:border-b-0 focus:outline-none focus:bg-primary/10"
                        >
                          <div className="text-xs sm:text-sm font-medium text-foreground">
                            {user.fullName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user.email} • Year {user.year} Sem {user.semester}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateNewChat}
                    disabled={!newMemberName.trim()}
                    className="flex-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity text-xs font-medium"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowNewChatForm(false)
                      setNewMemberName('')
                      setSelectedUser(null)
                      setSuggestions([])
                      setShowSuggestions(false)
                    }}
                    className="flex-1 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
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
            <div className="p-4 border-b border-border bg-primary/5 flex items-center gap-3 justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center">
                  {selectedConversation.avatar}
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm sm:text-base">{selectedConversation.name}</p>
                  <p className="text-xs text-muted-foreground">Last login: {selectedConversation.lastLogin || 'Never'}</p>
                </div>
              </div>
              <button
                onClick={handleDeleteChat}
                className="p-2 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors"
                title="Delete entire chat"
              >
                <Trash2 size={18} />
              </button>
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
                  className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'} group`}
                >
                  {!msg.isOwn && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs mr-2 flex-shrink-0">
                      {msg.senderAvatar}
                    </div>
                  )}
                  <div className="flex items-end gap-2">
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
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded text-red-500 transition-all"
                      title="Delete message"
                    >
                      <Trash2 size={14} />
                    </button>
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
