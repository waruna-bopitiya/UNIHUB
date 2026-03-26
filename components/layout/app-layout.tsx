'use client'

import { ReactNode, useState, useEffect } from 'react'
import { Sidebar } from './sidebar'
import { TopBar } from './top-bar'
import { ChatModal } from '@/components/chat-modal'
import { Toaster } from '@/components/ui/toaster'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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
            onChatClick={() => {
              setChatOpen(true)
              setSidebarOpen(false)
            }}
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

      {/* Chat Modal */}
      {isMounted && (
        <ChatModal 
          isOpen={chatOpen} 
          onClose={() => setChatOpen(false)}
        />
      )}
      <Toaster />
    </div>
  )
}
