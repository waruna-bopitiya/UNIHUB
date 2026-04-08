'use client'

import { X, Check, CheckCheck } from 'lucide-react'

interface ChatMessageProps {
  id: string
  sender: string
  senderAvatar: string
  content: string
  timestamp: string
  isOwn: boolean
  isRead?: boolean
  status?: 'pending' | 'sent' | 'delivered' | 'read'
  createdAt?: string
  isDeleted?: boolean
  onDelete?: (id: string) => void
}

// Helper to format date groups
export function getMessageDateGroup(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  
  if (messageDate.getTime() === today.getTime()) {
    return 'Today'
  } else if (messageDate.getTime() === yesterday.getTime()) {
    return 'Yesterday'
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
  }
}

// Message status indicator
function MessageStatus({ status, isRead }: { status?: string; isRead?: boolean }) {
  if (!status) return null
  
  const statusStyles: Record<string, string> = {
    pending: 'text-gray-400',
    sent: 'text-gray-400',
    delivered: 'text-gray-400',
    read: 'text-blue-400',
  }

  const iconStyle = statusStyles[status] || 'text-gray-400'

  if (status === 'read' || (isRead && status !== 'pending')) {
    return <CheckCheck className={`w-4 h-4 ${iconStyle}`} />
  }
  
  return <Check className={`w-4 h-4 ${iconStyle}`} />
}

// Individual message component
export function ChatMessageItem({
  id,
  sender,
  senderAvatar,
  content,
  timestamp,
  isOwn,
  isRead,
  status,
  createdAt,
  isDeleted,
  onDelete,
}: ChatMessageProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} gap-2 group hover:bg-gray-50 dark:hover:bg-gray-800/50 px-4 py-1 rounded-lg transition-colors`}>
      {/* Recipient Avatar */}
      {!isOwn && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 mt-1">
          {senderAvatar}
        </div>
      )}

      {/* Message Bubble */}
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-xs`}>
        {/* Sender name (only for received messages in groups) */}
        {!isOwn && (
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">
            {sender}
          </span>
        )}

        {/* Message Content */}
        <div className="flex items-end gap-1">
          <div
            className={`px-4 py-2 rounded-2xl break-words transition-colors ${
              isDeleted
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500 italic rounded-br-none'
                : isOwn
                ? 'bg-blue-500 text-white rounded-br-none hover:bg-blue-600'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <p className="text-sm">{isDeleted ? 'This message was deleted' : content}</p>
          </div>

          {/* Delete button (on hover, only if not deleted) */}
          {isOwn && !isDeleted && (
            <button
              onClick={() => onDelete?.(id)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded text-red-500 transition-all flex-shrink-0"
              title="Delete message"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Timestamp and Status */}
        <div className={`flex items-center gap-1 mt-1 text-xs ${
          isOwn 
            ? 'text-blue-600 dark:text-blue-400 flex-row-reverse'
            : 'text-gray-500 dark:text-gray-400'
        }`}>
          <span>{timestamp}</span>
          {isOwn && !isDeleted && <MessageStatus status={status} isRead={isRead} />}
        </div>
      </div>
    </div>
  )
}

// Date divider component
export function DateDivider({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 py-4">
      <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 px-3">
        {getMessageDateGroup(date)}
      </span>
      <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
    </div>
  )
}
