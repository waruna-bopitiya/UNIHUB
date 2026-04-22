'use client'

import { ReactNode, useState, useEffect, useRef } from 'react'
import { Sidebar } from './sidebar'
import { TopBar } from './top-bar'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const lastRightClickNoticeAtRef = useRef(0)
  const lastShortcutNoticeAtRef = useRef(0)
  const { toast } = useToast()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault()

      const now = Date.now()
      if (now - lastRightClickNoticeAtRef.current > 1500) {
        toast({
          title: 'Right-click disabled',
          description:
            'This page uses a custom themed notice instead of the browser alert.',
          duration: 2500,
          className:
            'border-primary/20 bg-gradient-to-r from-card to-secondary/30 text-card-foreground shadow-xl backdrop-blur',
        })
        lastRightClickNoticeAtRef.current = now
      }
    }

    document.addEventListener('contextmenu', handleContextMenu)
    return () => document.removeEventListener('contextmenu', handleContextMenu)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      const blockedShortcut =
        event.key === 'F12' ||
        ((event.ctrlKey || event.metaKey) && event.shiftKey && (key === 'i' || key === 'c'))

      if (!blockedShortcut) return

      event.preventDefault()
      event.stopPropagation()

      const now = Date.now()
      if (now - lastShortcutNoticeAtRef.current > 1500) {
        toast({
          title: 'Shortcut disabled',
          description: 'Developer tools shortcuts are disabled on this page.',
          duration: 2500,
          className:
            'border-primary/20 bg-gradient-to-r from-card to-secondary/30 text-card-foreground shadow-xl backdrop-blur',
        })
        lastShortcutNoticeAtRef.current = now
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toast])

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Overlay */}
      {isMounted && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {isMounted && (
        <div
          className={`fixed inset-y-0 left-0 w-64 z-40 transform transition-transform md:relative md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar 
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        {isMounted && (
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          {isMounted ? children : null}
        </main>
      </div>

      <Toaster />
    </div>
  )
}
