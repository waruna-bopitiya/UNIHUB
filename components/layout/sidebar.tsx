'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Video, BookOpen, Users, Settings, MessageCircle  , GraduationCap } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Home Feed', icon: Home },
  { href: '/live', label: 'Kuppi Live', icon: Video },
  //{ href: '/library', label: 'Library', icon: BookOpen },
  { href: '/quiz', label: 'quiz', icon: BookOpen },
 { href: '/library/resources', label: 'Resources', icon: BookOpen },
  { href: '/community', label: 'Community', icon: Users },
   { href: '/TutorForm1', label: 'Be a Tutor', icon: GraduationCap },
   { href: '/settings', label: 'Settings', icon: Settings },

]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-border bg-sidebar text-sidebar-foreground flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Kuppi Site
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Peer Learning Platform</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Link
          href="/messages"
          onClick={onClose}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            pathname === '/messages'
              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
              : 'text-sidebar-foreground hover:bg-sidebar-accent'
          }`}
          title="Open Messages"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">Messages</span>
        </Link>
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </aside>
  )
}
