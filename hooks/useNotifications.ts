import { useEffect, useState, useCallback } from 'react'

interface Notification {
  id: number
  user_id: string
  type: string
  title: string
  message: string
  related_stream_id: number | null
  is_read: boolean
  read_at: string | null
  created_at: string
  stream_title?: string
  scheduled_start_time?: string
  module_name?: string
}

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchNotifications = useCallback(
    async (isRead?: boolean) => {
      if (!userId) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        let url = `/api/notifications?userId=${userId}&limit=100`
        if (isRead !== undefined) {
          url += `&isRead=${isRead}`
        }

        const response = await fetch(url)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch notifications')
        }

        setNotifications(Array.isArray(data) ? data : [])
        const unread = Array.isArray(data) ? data.filter((n: Notification) => !n.is_read).length : 0
        setUnreadCount(unread)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
      } finally {
        setLoading(false)
      }
    },
    [userId]
  )

  const markAsRead = useCallback(
    async (notificationId: number) => {
      try {
        const response = await fetch(`/api/notifications/${notificationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: true }),
        })

        if (!response.ok) {
          throw new Error('Failed to mark as read')
        }

        const updated = await response.json()
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? updated : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch (err) {
        console.error('Error marking notification as read:', err)
      }
    },
    []
  )

  const markAllAsRead = useCallback(async () => {
    try {
      await Promise.all(
        notifications
          .filter((n) => !n.is_read)
          .map((n) => markAsRead(n.id))
      )
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }, [notifications, markAsRead])

  const deleteNotification = useCallback(
    async (notificationId: number) => {
      try {
        const response = await fetch(`/api/notifications/${notificationId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete notification')
        }

        setNotifications((prev) =>
          prev.filter((n) => n.id !== notificationId)
        )
        setUnreadCount((prev) => {
          const notification = notifications.find((n) => n.id === notificationId)
          return notification && !notification.is_read ? Math.max(0, prev - 1) : prev
        })
      } catch (err) {
        console.error('Error deleting notification:', err)
      }
    },
    [notifications]
  )

  useEffect(() => {
    fetchNotifications()

    // Refresh notifications every 30 seconds
    const interval = setInterval(() => fetchNotifications(), 30000)

    return () => clearInterval(interval)
  }, [fetchNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }
}
