import { AppLayout } from '@/components/layout/app-layout'
import { Users, MessageSquare, Star, Trophy } from 'lucide-react'

const topTutors = [
  {
    id: '1',
    name: 'Prof. Sarah Chen',
    specialization: 'Computer Science',
    students: 2847,
    rating: 4.9,
    reviews: 342,
    sessions: 156,
  },
  {
    id: '2',
    name: 'Dr. James Wilson',
    specialization: 'Economics',
    students: 1943,
    rating: 4.8,
    reviews: 287,
    sessions: 124,
  },
  {
    id: '3',
    name: 'Prof. Michael Brown',
    specialization: 'Physics',
    students: 1654,
    rating: 4.7,
    reviews: 198,
    sessions: 98,
  },
  {
    id: '4',
    name: 'Dr. Emma Roberts',
    specialization: 'Chemistry',
    students: 1432,
    rating: 4.8,
    reviews: 156,
    sessions: 87,
  },
]

const studyGroups = [
  {
    id: '1',
    name: 'Advanced React & Next.js',
    description: 'Learn modern React patterns and Next.js framework',
    members: 342,
    posts: 156,
    active: true,
  },
  {
    id: '2',
    name: 'IELTS & English Preparation',
    description: 'Prepare for IELTS exam with interactive sessions',
    members: 567,
    posts: 289,
    active: true,
  },
  {
    id: '3',
    name: 'Data Science & Machine Learning',
    description: 'Master ML algorithms and practical applications',
    members: 234,
    posts: 98,
    active: true,
  },
  {
    id: '4',
    name: 'Mathematics Problem Solving',
    description: 'Solve challenging math problems together',
    members: 189,
    posts: 67,
    active: true,
  },
]

export default function CommunityPage() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            UniHub Community
          </h1>
          <p className="text-muted-foreground">
            Connect with tutors, join study groups, and learn together
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Total Users
              </h3>
              <Users className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">45,782</p>
            <p className="text-xs text-muted-foreground mt-1">
              +1,234 this week
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Active Groups
              </h3>
              <Users className="w-5 h-5 text-accent" />
            </div>
            <p className="text-2xl font-bold text-foreground">234</p>
            <p className="text-xs text-muted-foreground mt-1">
              +18 this month
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Top Tutors
              </h3>
              <Trophy className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">89</p>
            <p className="text-xs text-muted-foreground mt-1">
              Rating 4.5+
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Posts Today
              </h3>
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">1,247</p>
            <p className="text-xs text-muted-foreground mt-1">
              Across all groups
            </p>
          </div>
        </div>

        {/* Top Tutors */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Top Tutors</h2>
            <a
              href="#"
              className="text-primary hover:text-accent transition-colors font-medium text-sm"
            >
              View All →
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topTutors.map((tutor) => (
              <div
                key={tutor.id}
                className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg">
                  {tutor.name.charAt(0)}
                </div>
                <h3 className="font-bold text-foreground">{tutor.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {tutor.specialization}
                </p>

                <div className="flex items-center justify-center gap-1 mt-3 mb-4">
                  <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
                  <span className="font-semibold text-foreground">
                    {tutor.rating}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({tutor.reviews})
                  </span>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground mb-4 pb-4 border-t border-border pt-4">
                  <p>
                    <span className="font-semibold text-foreground">
                      {tutor.students}
                    </span>{' '}
                    students
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">
                      {tutor.sessions}
                    </span>{' '}
                    sessions
                  </p>
                </div>

                <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm">
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Study Groups */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Popular Study Groups
            </h2>
            <a
              href="#"
              className="text-primary hover:text-accent transition-colors font-medium text-sm"
            >
              View All →
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {studyGroups.map((group) => (
              <div
                key={group.id}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-foreground text-lg">
                      {group.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {group.description}
                    </p>
                  </div>
                  {group.active && (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Active
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4 pb-4 border-t border-border pt-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{group.members} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{group.posts} posts</span>
                  </div>
                </div>

                <button className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm">
                  Join Group
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
