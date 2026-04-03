'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { ChatPanel } from '@/components/live/chat-panel'
import { Users, Clock, Share2, Play, Radio, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

// 1. Mock Data: Live යමින් පවතින වීඩියෝ දත්ත (YouTube IDs සමඟ)
const liveStreamsData = [
  { id: '1', videoId: 'jfKfPfyJRdk', title: 'React Performance Tuning', tutor: 'Alex Dev', viewers: 850 },
  { id: '2', videoId: 'tgbNymZ7vqY', title: 'Advanced CSS Layouts', tutor: 'Emma Web', viewers: 3200 }, // වැඩිම views
  { id: '3', videoId: 'ysz5S6PUM-U', title: 'Node.js Microservices', tutor: 'Jordan Backend', viewers: 420 },
  { id: '4', videoId: 'M7lc1UVf-VE', title: 'Database Design & Optimization', tutor: 'Prof. Sarah Chen', viewers: 1247 },
]

const mockMessages = [
  { id: '1', author: 'Emma', message: 'Great explanation!', timestamp: '2m' },
  { id: '2', author: 'Alex', message: 'Can you clarify the last point?', timestamp: '1m' },
  { id: '3', author: 'Prof. Chen', message: 'Sure! Let me explain it in more detail...', timestamp: '30s' },
  { id: '4', author: 'Jordan', message: 'This is so helpful 🎓', timestamp: 'now' },
]

const upcomingSessions = [
  { id: '1', title: 'Advanced Python Programming', tutor: 'Dr. Marcus Lee', time: 'Today at 3:00 PM', attendees: 234 },
  { id: '2', title: 'IELTS Writing Workshop', tutor: 'Sarah Williams', time: 'Tomorrow at 6:00 PM', attendees: 156 },
  { id: '3', title: 'Physics: Quantum Mechanics', tutor: 'Prof. David Brown', time: 'Friday at 4:30 PM', attendees: 312 },
]

// --- Components ---

// ප්‍රධාන වීඩියෝව සඳහා (Click කළ විට Play වේ)
function MainStreamPlayer({ videoId, title }: { videoId: string, title: string }) {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="w-full rounded-xl overflow-hidden border border-border bg-black relative" style={{ aspectRatio: '16/9' }}>
      {!isPlaying ? (
        <div className="w-full h-full relative group cursor-pointer" onClick={() => setIsPlaying(true)}>
          <img src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors">
            <div className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg transform group-hover:scale-105 transition-transform">
              <Play className="w-4 h-4 fill-white" /> Watch Live
            </div>
          </div>
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600/90 text-white text-xs px-2.5 py-1 rounded-full font-bold">
            <Radio className="w-3 h-3" /> LIVE NOW
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 overflow-hidden bg-black">
          <iframe
            className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 scale-[0.35] pointer-events-auto"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </div>
  )
}

// කුඩා කාඩ්පත් සඳහා (Hover කළ විට Play වේ)
function HoverPlayStreamCard({ stream }: { stream: any }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full bg-black" style={{ aspectRatio: '16/9' }}>
        {/* Hover කර නොමැති විට Thumbnail එක පෙන්වයි */}
        {!isHovered && (
          <>
            <img src={`https://img.youtube.com/vi/${stream.videoId}/mqdefault.jpg`} alt={stream.title} className="w-full h-full object-cover" />
            <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold flex items-center gap-1">
              <Radio className="w-3 h-3" /> Live
            </div>
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <Eye className="w-3 h-3" /> {stream.viewers}
            </div>
          </>
        )}

        {/* Hover කළ විට Mute වී Autoplay වන Iframe එක */}
        {isHovered && (
          <div className="absolute inset-0 overflow-hidden bg-black pointer-events-none">
            <iframe
              className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 scale-[0.35]"
              /* mute=1 අත්‍යවශ්‍ය වේ, නැතිනම් browser එක autoplay block කරයි */
              src={`https://www.youtube.com/embed/${stream.videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1`}
              title={stream.title}
              frameBorder="0"
              allow="autoplay"
            ></iframe>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-foreground line-clamp-1">{stream.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{stream.tutor}</p>
      </div>
    </div>
  )
}

// --- Main Page ---

export default function LivePage() {
  const router = useRouter();

  // Viewers ගණන අනුව sort කර වැඩිම එක ප්‍රධාන වීඩියෝව ලෙස ගැනීම
  const sortedStreams = [...liveStreamsData].sort((a, b) => b.viewers - a.viewers);
  const majorStream = sortedStreams[0];
  const otherStreams = sortedStreams.slice(1);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Create Live Stream Button */}
        <div className="flex justify-end mb-6">
          <button
            className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg font-semibold shadow hover:opacity-90 transition-opacity"
            onClick={() => router.push('/live/create')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Live Stream
          </button>
        </div>

        {/* Current Major Live Stream Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Main Stream Player */}
          <div className="lg:col-span-2 flex flex-col">
            <MainStreamPlayer videoId={majorStream.videoId} title={majorStream.title} />

            {/* Stream Details */}
            <div className="mt-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  {majorStream.title}
                </h3>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-muted-foreground font-medium">{majorStream.tutor}</p>
                  <span className="flex items-center gap-1 text-red-500 text-sm font-semibold">
                    <Eye className="w-4 h-4" /> {majorStream.viewers.toLocaleString()} watching
                  </span>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="h-[500px] lg:h-auto border border-border rounded-xl overflow-hidden">
            <ChatPanel messages={mockMessages} />
          </div>
        </div>

        {/* Other Active Live Streams (Hover to Play) */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-500" /> More Live Streams
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {otherStreams.map(stream => (
              <HoverPlayStreamCard key={stream.id} stream={stream} />
            ))}
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