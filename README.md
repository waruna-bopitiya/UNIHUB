# UniHub - Peer-to-Peer Learning Platform

A modern, full-stack learning platform that combines the social interaction feel of Facebook with the video-centric layout of YouTube. UniHub enables university students to learn collaboratively through live streaming, shared study materials, and community discussions.

## Features

### 🎓 Home Feed
- Post academic questions and discussions
- Share study insights with the community
- Like, comment, and share posts
- Filter posts by category (Questions, Study Materials, Discussions, Resources)
- Real-time feed updates

### 📹 Kuppi Live Streaming
- Live tutoring sessions with screen/camera sharing
- Real-time chat with live viewers
- Upcoming sessions discovery
- View and set reminders for sessions
- Live viewer count and session duration tracking

### 📚 Study Library
- Browse and download study materials (PDF, DOCX, PPT, ZIP)
- Filter by subject and file type
- Sort by popularity, recent uploads, or ratings
- View statistics (downloads, views, likes)
- Upload your own study materials

### 👥 Community
- Discover top-rated tutors by specialization
- Join active study groups
- View tutor ratings and student count
- Community statistics and engagement metrics
- Network with peers across different subjects

## Project Structure

```
unihub/
├── app/
│   ├── layout.tsx                 # Root layout with metadata
│   ├── globals.css               # Global styles and theme
│   ├── page.tsx                  # Home feed page
│   ├── live/
│   │   └── page.tsx              # Live streaming page
│   ├── library/
│   │   └── page.tsx              # Study library page
│   └── community/
│       └── page.tsx              # Community page
├── components/
│   ├── layout/
│   │   ├── app-layout.tsx        # Main app layout wrapper
│   │   ├── sidebar.tsx           # Navigation sidebar
│   │   └── top-bar.tsx           # Top navigation bar
│   ├── feed/
│   │   ├── post-card.tsx         # Post card component
│   │   └── create-post.tsx       # Post creation form
│   ├── live/
│   │   ├── stream-player.tsx     # Video stream player
│   │   └── chat-panel.tsx        # Live chat component
│   └── library/
│       ├── material-card.tsx     # Study material card
│       └── library-filters.tsx   # Filter and search controls
├── public/                        # Static assets
├── package.json                   # Dependencies
└── tailwind.config.ts            # Tailwind CSS configuration
```

## Tech Stack

### Frontend
- **Next.js 16**: React framework with App Router
- **React 19**: UI library with hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Lucide Icons**: Beautiful icon library

### Design System
- **Color Scheme**: Blue-based primary color with modern neutrals
- **Typography**: Clean, readable font hierarchy
- **Responsive**: Mobile-first design with breakpoints at md (768px) and lg (1024px)
- **Accessibility**: Semantic HTML, ARIA labels, and focus management

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Clone or download the project**
```bash
git clone <repository-url>
cd unihub
```

2. **Install dependencies**
```bash
pnpm install
# or
npm install
```

3. **Run development server**
```bash
pnpm dev
# or
npm run dev
```

4. **Open in browser**
Navigate to `http://localhost:3000`

## Key Components

### Layout Components
- **AppLayout**: Main wrapper providing sidebar + top bar + content area
- **Sidebar**: Collapsible navigation with active state tracking
- **TopBar**: Search bar, notifications, and user profile

### Feed Components
- **PostCard**: Displays posts with author info, content, and interactions
- **CreatePost**: Form for creating new posts with categories

### Live Components
- **StreamPlayer**: Video player with controls and live indicators
- **ChatPanel**: Real-time messaging during streams

### Library Components
- **MaterialCard**: Card displaying study material with download/like buttons
- **LibraryFilters**: Advanced filtering and search controls

## Responsive Design

The application is fully responsive:
- **Mobile (< 768px)**: Hamburger menu, stacked layout, single column
- **Tablet (768px - 1024px)**: Sidebar visible, 2-column grid layouts
- **Desktop (> 1024px)**: Full sidebar, multi-column grids, optimized spacing

## Theme Customization

Edit `/app/globals.css` to customize the color scheme:

```css
:root {
  --primary: oklch(0.5 0.15 260);      /* Main brand color */
  --accent: oklch(0.55 0.15 260);      /* Accent color */
  /* ... more color tokens ... */
}
```

## Component Features

### Posts
- Real-time like/unlike toggle
- Category tagging
- Author information with timestamp
- Interaction metrics

### Materials
- Multiple file types supported
- Download, view, and like tracking
- Smart filtering by subject/type
- Upload functionality ready

### Live Sessions
- Current and upcoming sessions
- Live viewer count
- Chat messaging
- Session reminders

## Next Steps for Backend Integration

To make this a fully functional platform, integrate:

1. **Database**: Supabase, Neon, or similar
   - Users table
   - Posts table
   - Materials storage
   - Messages/Chat storage

2. **Authentication**: 
   - User signup/login
   - Profile management
   - Role-based access (student/tutor)

3. **Real-time Features**:
   - WebSocket for live chat
   - Live viewer count updates
   - Real-time notifications

4. **File Storage**:
   - Vercel Blob or similar for material uploads
   - Stream video storage

5. **Payment (Optional)**:
   - Stripe integration for paid tutoring sessions
   - Subscription models

## Performance Optimization

- Server-side rendering for initial page load
- Client-side state management for interactions
- Optimized images and lazy loading
- CSS-in-JS with Tailwind for minimal bundle

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This project is created with [v0](https://v0.app) by Vercel.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues or questions, please open an issue in the repository or visit [v0.app](https://v0.app).
