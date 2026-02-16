'use client'

import { Search, Bell, User, Menu } from 'lucide-react'
import { useState } from 'react'

interface TopBarProps {
  onMenuClick?: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="h-16 border-b border-border bg-card sticky top-0 z-40">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="p-2 text-foreground hover:bg-secondary rounded-lg transition-colors md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses, tutors, materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 text-foreground hover:bg-secondary rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </button>

          {/* User Profile */}
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium hidden sm:inline">Profile</span>
          </button>
        </div>
      </div>
    </header>
  )
}
