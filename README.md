# SceneSavvy

A modern, Pinterest-style travel discovery platform where users can explore stunning destinations, create personalized travel boards, and plan unforgettable journeys with a global community of explorers.

![SceneSavvy](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css)

## Features

### Core Features
- **Infinite Scroll Feed**: Discover destinations with smooth, infinite scrolling and masonry grid layout
- **Interactive Map Explorer**: Explore destinations on an interactive map with satellite/street view toggle
- **Advanced Search**: Global search with real-time results for pins, users, boards, and tags
- **Smart Filters**: Filter by category, cost level, location, tags, and sorting options (recent, popular, trending)
- **Travel Boards**: Create and organize pins into themed boards (Dream, Planning, Completed)
- **Social Features**: Like, comment, save pins, and follow other travelers
- **User Profiles**: Customizable profiles with avatars, bio, location, and interests
- **Rich Pin Details**: Multi-image support (up to 10 images per pin), descriptions, tags, and metadata

### Technical Features
- **Server-Side Rendering**: Fast initial page loads with Next.js 14 App Router
- **Optimistic Updates**: Instant UI feedback for likes, saves, and other interactions
- **Responsive Design**: Fully responsive across all screen sizes (mobile, tablet, desktop)
- **Dark Mode**: Beautiful dark/light theme with smooth transitions
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: Premium design with Apple-like smoothness and editorial travel magazine aesthetics

## Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: High-quality component library built on Radix UI
- **Next Themes**: Dark mode support
- **React Hook Form**: Form management with validation
- **Zod**: Schema validation
- **Sonner**: Beautiful toast notifications

### Backend
- **Prisma**: Type-safe database ORM
- **PostgreSQL**: Relational database
- **Clerk**: Authentication and user management
- **Supabase**: Image storage and hosting

### Maps & Location
- **MapLibre GL**: Interactive maps with satellite/street views
- **MapTiler**: Map tiles and geocoding
- **OpenCage**: Location search and geocoding

## Installation

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database
- Clerk account for authentication
- Supabase account for image storage
- MapTiler API key
- OpenCage API key

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd vlogger-app
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Environment Variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# Supabase (Image Storage)
NEXT_PUBLIC_SUPABASE_URL="https://...supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."

# MapTiler (Maps)
NEXT_PUBLIC_MAPTILER_API_KEY="..."

# OpenCage (Geocoding)
NEXT_PUBLIC_OPENCAGE_API_KEY="..."
```

4. **Database Setup**

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database
npx prisma db seed
```

5. **Supabase Storage Setup**

Create a storage bucket named `vlogger-images` in your Supabase project:
- Go to Storage in Supabase dashboard
- Create new bucket: `vlogger-images`
- Set it to public
- Create folders: `pins/`, `avatars/`

6. **Run the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
vlogger-app/
├── app/                        # Next.js App Router
│   ├── api/                   # API routes
│   │   ├── pins/             # Pin CRUD operations
│   │   ├── boards/           # Board management
│   │   ├── user/             # User profile
│   │   ├── search/           # Global search
│   │   └── tags/             # Tag suggestions
│   ├── explore/              # Map explorer page
│   ├── pins/[pinId]/         # Pin detail page
│   ├── profile/[username]/   # User profile page
│   ├── boards/[boardId]/     # Board detail page
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Homepage
├── components/
│   ├── boards/               # Board components
│   ├── feed/                 # Feed & masonry grid
│   ├── layout/               # Header & footer
│   ├── map/                  # Map explorer
│   ├── modals/               # Create/edit modals
│   ├── profile/              # Profile components
│   ├── search/               # Global search
│   └── ui/                   # Shadcn UI components
├── lib/
│   ├── prisma.ts             # Prisma client
│   ├── supabase.ts           # Supabase utilities
│   └── utils.ts              # Utility functions
├── prisma/
│   └── schema.prisma         # Database schema
└── public/                   # Static assets
```

## Database Schema

### Key Models
- **User**: User profiles with Clerk integration
- **Pin**: Travel destination posts with images, location, and metadata
- **Board**: Collections of pins organized by category
- **Comment**: User comments on pins
- **Like**: Pin likes
- **Tag**: Hashtags for discovery
- **Follow**: User following relationships

## API Routes

### Pins
- `GET /api/pins` - Get pins with infinite scroll & filters
- `POST /api/pins` - Create new pin
- `GET /api/pins/[pinId]` - Get pin details
- `PATCH /api/pins/[pinId]` - Update pin
- `DELETE /api/pins/[pinId]` - Delete pin
- `POST /api/pins/[pinId]/like` - Toggle like
- `GET /api/pins/[pinId]/comments` - Get comments
- `POST /api/pins/[pinId]/comments` - Add comment

### Boards
- `GET /api/boards` - Get user boards
- `POST /api/boards` - Create board
- `GET /api/boards/[boardId]` - Get board details
- `PATCH /api/boards/[boardId]` - Update board
- `DELETE /api/boards/[boardId]` - Delete board
- `POST /api/boards/[boardId]/pins` - Add pin to board

### Users
- `GET /api/user/profile` - Get current user profile
- `PATCH /api/user/profile` - Update profile
- `GET /api/user/[username]` - Get user by username

### Search
- `GET /api/search?q={query}&type={type}` - Global search

## Design System

### Colors
**Light Mode:**
- Primary: #4169E1 (Royal Blue)
- Secondary: #4FB2A2 (Turquoise)
- Accent: #FF7B5A (Coral)
- Background: #F7F7F8

**Dark Mode:**
- Background: #0E1116
- Primary: #6BA6FF (Bright Blue)
- Secondary: #4DD1C1 (Mint Green)
- Accent: #FF795A (Coral)

### Typography
- Font Family: Inter (exclusively)
- Border Radius: 14-20px
- Aesthetic: Apple-like smoothness + editorial travel magazine vibes

## Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production
npm start            # Start production server

# Database
npx prisma studio    # Open Prisma Studio
npx prisma migrate dev    # Run migrations
npx prisma generate  # Generate Prisma client

# Code Quality
npm run lint         # Run ESLint
```

### Key Features Implementation

**Infinite Scroll**: Uses Intersection Observer API with cursor-based pagination

**Map Explorer**: MapLibre GL with custom markers and popups, satellite/street view toggle

**Search**: Debounced real-time search with results preview

**Image Upload**: Multi-image support with drag-and-drop, stored in Supabase

**Responsive Design**: Mobile-first approach with Tailwind breakpoints (sm, md, lg, xl)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Database Migration

```bash
# Production migration
npx prisma migrate deploy
```

### Environment Variables

Ensure all environment variables are set in your deployment platform:
- Database connection
- Clerk keys
- Supabase credentials
- API keys (MapTiler, OpenCage)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Clerk](https://clerk.com/)
- [Supabase](https://supabase.com/)
- [MapLibre GL](https://maplibre.org/)
- [Tailwind CSS](https://tailwindcss.com/)
