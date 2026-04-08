'use client'

import { Bell, BellOff } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface SetReminderProps {
  streamId: number
  streamTitle: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline'
  showLabel?: boolean
  className?: string
}

export function SetReminder({
  streamId,
  streamTitle,
  size = 'md',
  variant = 'outline',
  showLabel = true,
  className = '',
}: SetReminderProps) {
  const [hasReminder, setHasReminder] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  // Get current user ID
  const userId = typeof window !== 'undefined' ? localStorage.getItem('studentId') : null

  // Check if user has already set reminder
  useEffect(() => {
    setMounted(true)
    if (!userId) return

    async function checkReminder() {
      try {
        const response = await fetch(
          `/api/live/reminders?userId=${userId}&streamId=${streamId}`
        )
        if (response.ok) {
          const data = await response.json()
          setHasReminder(data.hasReminder || false)
        }
      } catch (error) {
        console.error('Error checking reminder:', error)
      }
    }

    checkReminder()
  }, [userId, streamId])

  const handleToggleReminder = async () => {
    if (!userId) {
      toast({
        title: 'Please log in',
        description: 'You need to be logged in to set reminders',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/live/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          streamId,
          action: hasReminder ? 'remove' : 'set',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update reminder')
      }

      const data = await response.json()
      setHasReminder(!hasReminder)

      toast({
        title: hasReminder ? 'Reminder Removed' : 'Reminder Set',
        description: hasReminder
          ? `You will no longer receive reminders for "${streamTitle}"`
          : `You will receive a notification 30 minutes before "${streamTitle}" starts`,
        variant: 'default',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update reminder',
        variant: 'destructive',
      })
      console.error('Error toggling reminder:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  const sizeClasses = {
    sm: 'h-8 px-2.5 gap-1.5 text-xs',
    md: 'h-9 px-3 gap-2 text-sm',
    lg: 'h-10 px-4 gap-2 text-base',
  }

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleToggleReminder}
      disabled={loading}
      className={`transition-all ${sizeClasses[size]} ${
        hasReminder ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-blue-500/30' : ''
      } ${className}`}
      title={hasReminder ? 'Remove reminder' : 'Set reminder'}
    >
      {hasReminder ? (
        <Bell className="w-4 h-4 fill-current" />
      ) : (
        <BellOff className="w-4 h-4" />
      )}
      {showLabel && (hasReminder ? 'Reminder Set' : 'Set Reminder')}
    </Button>
  )
}
