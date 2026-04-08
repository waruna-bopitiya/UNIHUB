'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Search, Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChatMessageItem, DateDivider, getMessageDateGroup } from './message-display'

interface ChatMessage {
  id: string
  sender: string
  senderAvatar: string
  content: string
  timestamp: string
  isOwn: boolean
  isDeleted?: boolean
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
  const [userYear, setUserYear] = useState<number | null>(null)
  const [userSemester, setUserSemester] = useState<number | null>(null)
  
  // User suggestions state
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  
  // Profile display state
  const [showRecipientProfile, setShowRecipientProfile] = useState(false)
  const [recipientProfiles, setRecipientProfiles] = useState<any[]>([])
  
  // Resizable state
  const [width, setWidth] = useState(800) // increased default width
  const [height, setHeight] = useState(600)
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [cursor, setCursor] = useState('default')
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

        // Fetch user's profile to get year and semester
        const profileResponse = await fetch(`/api/user/profile?id=${storedUserId}`)
        const profileData = await profileResponse.json()
        if (profileData.year_of_university && profileData.semester) {
          setUserYear(profileData.year_of_university)
          setUserSemester(profileData.semester)
          console.log('📚 User year:', profileData.year_of_university, 'Semester:', profileData.semester)
        }

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

  // Auto-refresh chats every 2 seconds when chat is open
  useEffect(() => {
    if (!isOpen || !userId) return

    const refreshInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/chat?userId=${userId}`)
        const result = await response.json()

        if (result.status === 'success' && Array.isArray(result.data)) {
          setConversations(result.data)
          
          // Keep the currently selected conversation updated
          if (selectedConversation) {
            const updated = result.data.find((c: any) => c.id === selectedConversation.id)
            if (updated) {
              setSelectedConversation(updated)
            }
          }
        }
      } catch (error) {
        console.error('❌ Error refreshing chats:', error)
      }
    }, 2000) // Refresh every 2 seconds

    return () => clearInterval(refreshInterval)
  }, [isOpen, userId, selectedConversation])

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

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current && selectedConversation) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [selectedConversation?.messages.length, selectedConversation?.id])
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

  const filteredConversations = conversations.filter((conv: any) =>
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
        // Filter to only show students from same year and semester
        const suitableStudents = result.data.filter(
          (user: any) => user.year === userYear && user.semester === userSemester
        )
        console.log('✅ Got', suitableStudents.length, 'suitable suggestions (same year/semester)')
        setSuggestions(suitableStudents)
        setShowSuggestions(suitableStudents.length > 0)
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

    const messageContent = newMessage.trim()
    const messageId = `temp-${Date.now()}`
    const timestamp = new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })

    // Create optimistic message object
    const optimisticMessage = {
      id: messageId,
      sender: 'You',
      senderAvatar: 'Y',
      content: messageContent,
      timestamp: timestamp,
      isOwn: true,
      isRead: true,
    }

    let updatedConversations: any = conversations

    try {
      // UPDATE UI IMMEDIATELY (Optimistic Update)
      console.log('💬 Displaying message immediately')

      updatedConversations = conversations.map((conv: any) => {
        if (conv.id === selectedConversation.id) {
          return {
            ...conv,
            messages: [...conv.messages, optimisticMessage],
            lastMessage: messageContent,
          }
        }
        return conv
      })

      setConversations(updatedConversations)
      setSelectedConversation(updatedConversations.find((c: any) => c.id === selectedConversation.id) || null)
      setNewMessage('')

      // SEND TO BACKEND IN BACKGROUND
      console.log('📤 Sending message to backend')
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: parseInt(selectedConversation.id),
          sender: 'You',
          senderAvatar: 'Y',
          content: messageContent,
          isOwn: true,
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ Failed to send message:', result.message)
        // Remove optimistic message if failed - use updatedConversations
        const rollbackConversations = updatedConversations.map((conv: any) => {
          if (conv.id === selectedConversation.id) {
            return {
              ...conv,
              messages: conv.messages.filter((msg: any) => msg.id !== messageId),
            }
          }
          return conv
        })
        setConversations(rollbackConversations)
        alert('Failed to send message. Please try again.')
        return
      }

      console.log('✅ Message sent successfully to backend')

      // Update with real message ID and show profile
      if (result.recipientProfiles && result.recipientProfiles.length > 0) {
        console.log('📋 Displaying recipient profile')
        setRecipientProfiles(result.recipientProfiles)
        setShowRecipientProfile(true)
        setTimeout(() => {
          setShowRecipientProfile(false)
        }, 5000)
      }

      // Replace optimistic message with real one - use updatedConversations
      const finalConversations = updatedConversations.map((conv: any) => {
        if (conv.id === selectedConversation.id) {
          return {
            ...conv,
            messages: conv.messages.map((msg: any) =>
              msg.id === messageId ? result.data[0] : msg
            ),
          }
        }
        return conv
      })

      setConversations(finalConversations)
      setSelectedConversation(finalConversations.find((c: any) => c.id === selectedConversation.id) || null)
    } catch (error) {
      console.error('❌ Error sending message:', error)
      // Remove optimistic message on error - use updatedConversations which includes optimistic message
      const rollbackConversations = updatedConversations.map((conv: any) => {
        if (conv.id === selectedConversation.id) {
          return {
            ...conv,
            messages: conv.messages.filter((msg: any) => msg.id !== messageId),
          }
        }
        return conv
      })
      setConversations(rollbackConversations)
      alert('Network error. Please try again.')
    }
  }

  const handleCreateNewChat = async () => {
    if (!newMemberName.trim() || !userId) return

    // Validate selected user is from same year/semester
    if (selectedUser && (selectedUser.year !== userYear || selectedUser.semester !== userSemester)) {
      alert(`⚠️ You can only message students from Year ${userYear}, Semester ${userSemester}. This student is from Year ${selectedUser.year}, Semester ${selectedUser.semester}.`)
      return
    }

    try {
      const displayName = selectedUser?.fullName || newMemberName
      console.log('💾 Creating new chat with participant:', displayName, `(Year ${selectedUser?.year}, Sem ${selectedUser?.semester})`)

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
      const updatedConversations = conversations.filter((c: any) => {
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

      console.log('✅ Message soft-deleted successfully from database (WhatsApp style)')
      console.log('📊 Updating UI for conversation:', selectedConversation.id)

      // Mark message as deleted in frontend state (not removing it completely)
      const updatedConversations = conversations.map((conv: any) => {
        if (conv.id === selectedConversation.id) {
          console.log('Found matching conversation')
          
          const messageIdNum = parseInt(messageId, 10)
          const newMessages = conv.messages.map((m: any) => {
            const msgIdNum = parseInt(m.id, 10)
            
            if (msgIdNum === messageIdNum) {
              console.log('🎯 Marking message ID:', m.id, 'as deleted')
              return {
                ...m,
                isDeleted: true,
                content: '', // Clear the content, will show "This message was deleted"
              }
            }
            return m
          })
          
          // Update lastMessage if the last message was deleted
          const lastMsg = newMessages[newMessages.length - 1]
          const lastMessageText = lastMsg?.isDeleted ? 'This message was deleted' : (lastMsg?.content || 'No messages yet')
          
          return {
            ...conv,
            messages: newMessages,
            lastMessage: lastMessageText,
          }
        }
        return conv
      })

      console.log('🔄 Setting updated conversations')
      setConversations(updatedConversations)
      
      const updated = updatedConversations.find((c: any) => c.id === selectedConversation.id)
      setSelectedConversation(updated || null)
      console.log('✅ UI updated successfully - message now shows as deleted')
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
      {/* Header - WhatsApp Green Style */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-teal-500 to-cyan-500 dark:from-teal-700 dark:to-cyan-700">
        <div>
          <h2 className="font-bold text-white text-lg">Messages</h2>
          <p className="text-xs text-teal-100 mt-0.5">Stay connected with your class</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
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

          {/* Conversations - WhatsApp List Style */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
            {filteredConversations.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <p className="text-sm">No conversations yet</p>
                </div>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full px-4 py-3 text-left transition-colors ${
                    selectedConversation?.id === conv.id
                      ? 'bg-teal-50 dark:bg-teal-900/30 border-l-4 border-l-teal-500'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold flex items-center justify-center text-sm flex-shrink-0">
                      {conv.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`font-semibold text-sm truncate ${conv.unread > 0 ? 'text-foreground font-bold' : 'text-foreground'}`}>
                          {conv.name}
                        </p>
                        {conv.unread > 0 && (
                          <span className="text-xs bg-teal-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0">
                            {conv.unread > 99 ? '99+' : conv.unread}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs truncate ${conv.unread > 0 ? 'text-gray-600 dark:text-gray-300 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConversation && (
          <div className="flex-1 flex flex-col w-full sm:w-2/3 lg:w-3/5 xl:w-2/3">
            {/* Chat Header - WhatsApp Style */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-gray-800 dark:to-gray-800 flex items-center gap-3 justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold flex items-center justify-center text-lg">
                  {selectedConversation.avatar}
                </div>
                <div>
                  <p className="font-bold text-foreground text-base">{selectedConversation.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedConversation.lastLogin ? `Last active ${selectedConversation.lastLogin}` : 'Last login: Never'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleDeleteChat}
                className="p-2 hover:bg-red-500/20 rounded-full text-red-500 transition-colors"
                title="Delete entire chat"
              >
                <Trash2 size={20} />
              </button>
            </div>

            {/* Messages - WhatsApp Style */}
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
              {selectedConversation.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">No messages yet</p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs">Start the conversation by sending a message!</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {(() => {
                    let lastDateGroup: string | null = null
                    const elements: React.ReactNode[] = []

                    selectedConversation.messages.forEach((msg, idx) => {
                      const currentDateGroup = getMessageDateGroup(msg.timestamp || new Date().toISOString())
                      
                      // Add date divider if date changed
                      if (currentDateGroup !== lastDateGroup) {
                        elements.push(
                          <DateDivider key={`divider-${idx}`} date={msg.timestamp || new Date().toISOString()} />
                        )
                        lastDateGroup = currentDateGroup
                      }

                      // Add message
                      elements.push(
                        <ChatMessageItem
                          key={msg.id}
                          id={msg.id}
                          sender={msg.sender}
                          senderAvatar={msg.senderAvatar}
                          content={msg.content}
                          timestamp={msg.timestamp}
                          isOwn={msg.isOwn}
                          isRead={(msg as any).isRead}
                          status={(msg as any).status}
                          isDeleted={(msg as any).isDeleted}
                          onDelete={handleDeleteMessage}
                        />
                      )
                    })

                    return elements
                  })()}
                  <div ref={messagesEndRef} className="h-0" />
                </div>
              )}
            </div>

            {/* Recipient Profile Display */}
            {showRecipientProfile && recipientProfiles.length > 0 && (
              <div className="p-4 border-t border-border bg-green-50 dark:bg-green-950/20 animate-in fade-in slide-in-from-bottom-4 duration-300 max-h-48 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-sm text-foreground">
                    ✓ Message sent to {recipientProfiles.length} {recipientProfiles.length === 1 ? 'person' : 'people'}
                  </p>
                  <button
                    onClick={() => setShowRecipientProfile(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {recipientProfiles.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-600 font-bold flex items-center justify-center text-xs flex-shrink-0">
                        {item.profile.avatar || (item.profile.firstName || '').charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {item.profile.firstName} {item.profile.secondName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.profile.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message Input - WhatsApp Style */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex gap-3 items-end">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  className="flex-1 rounded-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  size="lg"
                  className="rounded-full w-10 h-10 p-0 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 flex items-center justify-center"
                >
                  <Send className="w-5 h-5" />
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
