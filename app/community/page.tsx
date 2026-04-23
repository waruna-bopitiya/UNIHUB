'use client'

// මේ පේළිය අනිවාර්යයෙන්ම අවශ්‍යයි. 
// මෙයින් Next.js වලට කියනවා build වෙලාවේ Prerender කරන්න එපා කියලා.
export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { PostFeed } from '@/components/feed/feed'
import { useSearchParams } from 'next/navigation'

// searchParams පාවිච්චි කරන කොටස වෙනම Component එකකට ගත්තා
function CommunityContent() {
  const searchParams = useSearchParams()
  const [userId, setUserId] = useState<string | undefined>()
  const highlightedPostId = searchParams.get('post') || undefined

  useEffect(() => {
    // Get userId from localStorage
    const storedUserId = localStorage.getItem('studentId')
    setUserId(storedUserId || undefined)
  }, [])

  return (
    <div className="w-full py-6 px-4 md:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          UniHub Community
        </h1>
        <p className="text-muted-foreground">
          Connect with tutors, join study groups, and learn together
        </p>
      </div>

      {/* Feed Section */}
      {highlightedPostId && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Feed</h2>
          <PostFeed userId={userId} highlightedPostId={highlightedPostId} />
        </section>
      )}

      {/* Full Feed Section */}
      <section className="mt-12 pt-12 border-t border-border">
        <h2 className="text-2xl font-bold text-foreground mb-6">Community Feed</h2>
        <PostFeed userId={userId} highlightedPostId={highlightedPostId} />
      </section>
    </div>
  )
}

// ප්‍රධාන Page එක මෙතනින් Export වෙනවා
export default function CommunityPage() {
  return (
    <AppLayout>
      {/* useSearchParams පාවිච්චි කරන ඕනෑම තැනක් Suspense එකක් ඇතුළේ තිබිය යුතුයි */}
      <Suspense fallback={<div className="p-10 text-center">Loading Community...</div>}>
        <CommunityContent />
      </Suspense>
    </AppLayout>
  )
}