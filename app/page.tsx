import { AppLayout } from '@/components/layout/app-layout'
import { CreatePost } from '@/components/feed/create-post'
import { PostCard } from '@/components/feed/post-card'

const mockPosts = [
  {
    id: '1',
    author: {
      name: 'Prof. Sarah Chen',
      avatar: 'SC',
      role: 'Computer Science Tutor',
    },
    timestamp: '2 hours ago',
    content:
      'Just wrapped up an advanced React session! Here are some key takeaways: Understanding hooks is crucial for modern React development. Remember to use useCallback and useMemo wisely to avoid performance pitfalls.',
    category: 'Study Material',
    likes: 248,
    comments: 32,
    shares: 18,
  },
  {
    id: '2',
    author: {
      name: 'Alex Kumar',
      avatar: 'AK',
      role: 'Mathematics Student',
    },
    timestamp: '4 hours ago',
    content:
      "Does anyone have resources on differential equations? I'm struggling with the integration techniques covered in today's lecture. Any study groups forming this semester?",
    category: 'Question',
    likes: 65,
    comments: 18,
    shares: 4,
  },
  {
    id: '3',
    author: {
      name: 'Dr. James Wilson',
      avatar: 'JW',
      role: 'Economics Professor',
    },
    timestamp: '6 hours ago',
    content:
      'Exciting opportunity! I\'m organizing a live discussion on "Economic Trends 2024" next Tuesday at 7 PM. We\'ll have industry experts joining us. Register below to get access and submit your questions!',
    category: 'Event',
    likes: 412,
    comments: 89,
    shares: 156,
  },
]

export default function Home() {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-6">
        {/* Create Post Section */}
        <CreatePost />

        {/* Feed */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Latest in Your Network
          </h2>
          {mockPosts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
