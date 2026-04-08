'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { useState, useEffect } from 'react'
import { MessageCircle, Search, Plus, X, Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChatMessageItem, DateDivider, getMessageDateGroup } from '@/components/chat/message-display'

interface ChatMessage {
  id: string
  sender: string
  senderAvatar: string
  content: string
  timestamp: string
  isOwn: boolean
  isRead?: boolean
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

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [loadingChats, setLoadingChats] = useState(true)
  const [userYear, setUserYear] = useState<number | null>(null)
  const [userSemester, setUserSemester] = useState<number | null>(null)
  const [showNewChatForm, setShowNewChatForm] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  // Load user ID and fetch chats on mount
  useEffect(() => {
    const loadChats = async () => {
      try {
        const storedUserId = localStorage.getItem('studentId')
        if (!storedUserId) {
          console.log('⚠️ No user ID found')
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
        }

        const response = await fetch(`/api/chat?userId=${storedUserId}`)
        const result = await response.json()

        if (result.status === 'success' && Array.isArray(result.data)) {
          console.log('✅ Chats loaded from database:', result.data.length, 'chats')
          setConversations(result.data)
          if (result.data.length > 0) {
            setSelectedConversation(result.data[0])
          }
        }
      } catch (error) {
        console.error('❌ Error loading chats:', error)
      } finally {
        setLoadingChats(false)
      }
    }

    loadChats()
  }, [])

  // Auto-refresh chats every 2 seconds
  useEffect(() => {
    if (!userId) return

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
  }, [userId, selectedConversation])

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
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(value)}&limit=8`)
      const result = await response.json()

      if (result.status === 'success' && Array.isArray(result.data)) {
        const suitableStudents = result.data.filter(
          (user: any) => user.year === userYear && user.semester === userSemester
        )
        setSuggestions(suitableStudents)
        setShowSuggestions(suitableStudents.length > 0)
      }
    } catch (error) {
      console.error('❌ Error fetching suggestions:', error)
    }
  }

  const handleSelectUser = (user: any) => {
    setSelectedUser(user)
    setNewMemberName(user.fullName)
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleCreateNewChat = async () => {
    if (!newMemberName.trim() || !userId) return

    if (selectedUser && (selectedUser.year !== userYear || selectedUser.semester !== userSemester)) {
      alert(`⚠️ You can only message students from Year ${userYear}, Semester ${userSemester}`)
      return
    }

    try {
      const displayName = selectedUser?.fullName || newMemberName
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
        alert('Error creating chat: ' + apiResult.message)
        return
      }

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
      alert('Failed to create chat')
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !userId) return

    const messageContent = newMessage.trim()
    const messageId = `temp-${Date.now()}`
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const optimisticMessage = {
      id: messageId,
      sender: 'You',
      senderAvatar: 'Y',
      content: messageContent,
      timestamp: timestamp,
      isOwn: true,
      isRead: true,
    }

    try {
      let updatedConversations = conversations.map((conv) => {
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
      setSelectedConversation(updatedConversations.find((c) => c.id === selectedConversation.id) || null)
      setNewMessage('')

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
        const rollbackConversations = updatedConversations.map((conv) => {
          if (conv.id === selectedConversation.id) {
            return {
              ...conv,
              messages: conv.messages.filter((msg) => msg.id !== messageId),
            }
          }
          return conv
        })
        setConversations(rollbackConversations)
        return
      }

      const finalConversations = updatedConversations.map((conv) => {
        if (conv.id === selectedConversation.id) {
          return {
            ...conv,
            messages: conv.messages.map((msg) => msg.id === messageId ? result.data[0] : msg),
          }
        }
        return conv
      })

      setConversations(finalConversations)
      setSelectedConversation(finalConversations.find((c) => c.id === selectedConversation.id) || null)
    } catch (error) {
      console.error('❌ Error sending message:', error)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedConversation) return

    if (!confirm('Are you sure you want to delete this message?')) {
      return
    }

    try {
      const id = parseInt(messageId, 10)
      const response = await fetch(`/api/chat/messages/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        alert('Error deleting message')
        return
      }

      const updatedConversations = conversations.map((conv) => {
        if (conv.id === selectedConversation.id) {
          const messageIdNum = parseInt(messageId, 10)
          const newMessages = conv.messages.map((m) => {
            const msgIdNum = parseInt(m.id, 10)
            if (msgIdNum === messageIdNum) {
              return {
                ...m,
                isDeleted: true,
                content: '',
              }
            }
            return m
          })

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

      setConversations(updatedConversations)
      const updated = updatedConversations.find((c) => c.id === selectedConversation.id)
      setSelectedConversation(updated || null)
    } catch (error) {
      console.error('❌ Error deleting message:', error)
      alert('Failed to delete message')
    }
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AppLayout>
      <div className="flex h-screen bg-background">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-border flex flex-col bg-background">
          {/* Header */}
          <div className="p-4 border-b border-border bg-gradient-to-r from-teal-500 to-cyan-500 dark:from-teal-700 dark:to-cyan-700">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-6 h-6 text-white" />
              <h1 className="text-2xl font-bold text-white">Messages</h1>
            </div>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>

          {/* New Chat Button */}
          <div className="p-3 border-b border-border">
            {!showNewChatForm ? (
              <button
                onClick={() => setShowNewChatForm(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
              >
                <Plus className="w-4 h-4" />
                <span>New Chat</span>
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter member name..."
                  value={newMemberName}
                  onChange={handleMemberNameChange}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateNewChat()
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  autoFocus
                />

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute w-full bg-card border border-border rounded-lg shadow-lg z-50 mt-1 max-h-48 overflow-y-auto">
                    {suggestions.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className="w-full text-left px-3 py-2 hover:bg-muted transition-colors border-b border-border last:border-b-0"
                      >
                        <p className="text-sm font-medium">{user.fullName}</p>
                        <p className="text-xs text-muted-foreground">Year {user.year}, Sem {user.semester}</p>
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleCreateNewChat}
                    className="flex-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 text-sm font-medium"
                  >
                    Create Chat
                  </button>
                  <button
                    onClick={() => {
                      setShowNewChatForm(false)
                      setNewMemberName('')
                      setSelectedUser(null)
                      setSuggestions([])
                    }}
                    className="flex-1 px-3 py-2 rounded-lg border border-border hover:bg-muted text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No conversations yet</p>
                </div>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full text-left p-3 border-b border-border hover:bg-muted transition-colors ${
                    selectedConversation?.id === conv.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0">
                      {conv.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{conv.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <div className="bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                        {conv.unread}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-background">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-gradient-to-r from-teal-500 to-cyan-500 dark:from-teal-700 dark:to-cyan-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 text-white font-bold flex items-center justify-center">
                    {selectedConversation.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-white">{selectedConversation.name}</p>
                    <p className="text-xs text-teal-100">{selectedConversation.lastLogin}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 p-4 space-y-4">
                {selectedConversation.messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No messages yet</p>
                  </div>
                ) : (
                  (() => {
                    let lastDateGroup: string | null = null
                    const elements: React.ReactNode[] = []

                    selectedConversation.messages.forEach((msg, idx) => {
                      const currentDateGroup = getMessageDateGroup(msg.timestamp || '')

                      if (currentDateGroup !== lastDateGroup) {
                        elements.push(
                          <DateDivider key={`divider-${idx}`} date={msg.timestamp || ''} />
                        )
                        lastDateGroup = currentDateGroup
                      }

                      elements.push(
                        <ChatMessageItem
                          key={msg.id}
                          id={msg.id}
                          sender={msg.sender}
                          senderAvatar={msg.senderAvatar}
                          content={msg.content}
                          timestamp={msg.timestamp}
                          isOwn={msg.isOwn}
                          isRead={msg.isRead}
                          isDeleted={msg.isDeleted}
                          onDelete={handleDeleteMessage}
                        />
                      )
                    })

                    return elements
                  })()
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-border bg-white dark:bg-gray-800">
                <div className="flex gap-3">
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
                    className="flex-1 rounded-full px-4 py-2.5"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    size="lg"
                    className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm">Choose a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
