import { AppLayout } from '@/components/layout/app-layout'
import { StreamPlayer } from '@/components/live/stream-player'
import { ChatPanel } from '@/components/live/chat-panel'
import { Users, Clock, Share2 } from 'lucide-react'

const mockMessages = [
  { id: '1', author: 'Emma', message: 'Great explanation!', timestamp: '2m' },
  { id: '2', author: 'Alex', message: 'Can you clarify the last point?', timestamp: '1m' },
  {
    id: '3',
    author: 'Prof. Chen',
    message: 'Sure! Let me explain it in more detail...',
    timestamp: '30s',
  },
  { id: '4', author: 'Jordan', message: 'This is so helpful 🎓', timestamp: 'now' },
]

const upcomingSessions = [
  {
    id: '1',
    title: 'Advanced Python Programming',
    tutor: 'Dr. Marcus Lee',
    time: 'Today at 3:00 PM',
    attendees: 234,
  },
  {
    id: '2',
    title: 'IELTS Writing Workshop',
    tutor: 'Sarah Williams',
    time: 'Tomorrow at 6:00 PM',
    attendees: 156,
  },
  {
    id: '3',
    title: 'Physics: Quantum Mechanics',
    tutor: 'Prof. David Brown',
    time: 'Friday at 4:30 PM',
    attendees: 312,
  },
]

export default function LivePage() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Current Live Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Stream */}
          <div className="lg:col-span-2">
            <StreamPlayer
              title="Database Design & Optimization"
              tutorName="Prof. Sarah Chen"
              liveViewers={1247}
              duration="42m 15s"
            />

            {/* Stream Details */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    Database Design & Optimization
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Learn best practices for designing scalable databases
                  </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="h-full min-h-96">
            <ChatPanel messages={mockMessages} />
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Upcoming Live Sessions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingSessions.map((session) => (
              <div
                key={session.id}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-foreground">{session.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {session.tutor}
                    </p>
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                    Upcoming
                  </span>
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {session.time}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {session.attendees} people joining
                  </div>
                </div>

                <button className="w-full mt-4 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium">
                  Set Reminder
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
