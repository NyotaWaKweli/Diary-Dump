# Diary Dump

A secure, production-ready diary wall application. Users create spaces, write sticky notes, and interact through reactions and comments.

## Features

- **Scattered Sticky Notes** — Notes appear on a wall at random angles and positions
- **Real-time Updates** — See new notes appear instantly via BroadcastChannel
- **Authentication** — Custom JWT-based auth with bcrypt password hashing
- **Reactions** — Emoji reactions (❤️ 😂 😢 🔥) on notes
- **Comments** — Threaded discussions under each note
- **Image Uploads** — Attach photos to notes via Supabase Storage
- **Night Mode** — Toggle between light and dark themes
- **Responsive Design** — Works on mobile, tablet, and desktop
- **PWA Ready** — Installable as a Progressive Web App

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Supabase (PostgreSQL, Storage, Realtime)
- **Auth**: Custom JWT with jose, bcryptjs password hashing
- **Database**: Supabase PostgreSQL with Row Level Security

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd diary-dump
npm install
```

### 2. Create Supabase Project

1. Go to https://app.supabase.com and create a new project
2. Once created, go to Project Settings → API
3. Copy the following values:
   - Project URL → NEXT_PUBLIC_SUPABASE_URL
   - Project API Keys → anon key → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - Project API Keys → service_role key → SUPABASE_SERVICE_ROLE_KEY

### 3. Set Up Database

1. In Supabase Dashboard, go to SQL Editor
2. Click New Query
3. Copy the contents of supabase/migrations/001_initial.sql
4. Paste and click Run

This creates all tables, indexes, RLS policies, and storage buckets.

### 4. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit .env.local and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Generate a JWT secret:
```bash
openssl rand -base64 32
```

### 5. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

### 6. Build for Production

```bash
npm run build
```

## Deploy to Vercel

1. Push your code to GitHub
2. Go to https://vercel.com and import your repository
3. Add all environment variables from .env.local in Vercel Dashboard → Settings → Environment Variables
4. Deploy!

## Project Structure

```
diary-dump/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth routes (login, register)
│   ├── (main)/             # Main app routes
│   │   ├── spaces/[id]/    # Individual space wall
│   │   └── settings/       # User settings
│   ├── api/                # API routes
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── sticky-note.tsx     # Individual note card
│   ├── note-wall.tsx       # Scattered wall container
│   ├── add-note-modal.tsx  # Create note form
│   ├── note-detail-modal.tsx # Note detail view
│   ├── space-card.tsx      # Menu list item
│   ├── create-space-modal.tsx # New space form
│   ├── navbar.tsx          # Top navigation
│   ├── providers.tsx       # Context providers
│   └── toast.tsx           # Toast notifications
├── lib/                    # Utilities and data layer
│   ├── auth.ts             # JWT auth utilities
│   ├── dal.ts              # Data Access Layer
│   ├── utils.ts            # Helper functions
│   └── supabase/           # Supabase clients
├── types/                  # TypeScript types
├── supabase/
│   └── migrations/         # Database migrations
└── public/                 # Static assets
```

## Database Schema

### users
- id (UUID, PK)
- email (TEXT, UNIQUE)
- display_name (TEXT)
- avatar_url (TEXT)
- email_verified (BOOLEAN)
- settings (JSONB)
- created_at (TIMESTAMPTZ)

### spaces
- id (UUID, PK)
- name (TEXT)
- slug (TEXT, UNIQUE)
- owner_id (UUID, FK → users)
- is_public (BOOLEAN)
- is_pinned (BOOLEAN)
- password_hash (TEXT)
- theme (TEXT)
- created_at / updated_at (TIMESTAMPTZ)

### notes
- id (UUID, PK)
- space_id (UUID, FK → spaces)
- author_id (UUID, FK → users)
- content / content_html (TEXT)
- color (TEXT)
- tags (TEXT[])
- position_x / position_y / rotation (FLOAT)
- image_url (TEXT)
- is_archived (BOOLEAN)
- reactions_* (INTEGER)
- created_at / updated_at (TIMESTAMPTZ)

### comments
- id (UUID, PK)
- note_id (UUID, FK → notes)
- author_id (UUID, FK → users)
- content (TEXT)
- created_at (TIMESTAMPTZ)

### reactions
- id (UUID, PK)
- note_id (UUID, FK → notes)
- user_id (UUID, FK → users)
- type (TEXT: heart/laugh/sad/fire)
- created_at (TIMESTAMPTZ)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Sign in |
| POST | /api/auth/logout | Sign out |
| GET | /api/auth/me | Get current user |
| POST | /api/spaces | Create space |
| POST | /api/notes | Create note |
| DELETE | /api/notes/[id] | Delete note |
| POST | /api/notes/[id]/react | Toggle reaction |
| GET | /api/notes/[id]/comments | Get comments |
| POST | /api/notes/[id]/comments | Add comment |
| PATCH | /api/users/settings | Update settings |

## Security

- Row Level Security (RLS) on all tables
- JWT tokens stored in httpOnly cookies
- Input sanitization with DOMPurify
- Password hashing with bcrypt (12 rounds)
- CSP headers configured in next.config.js
- Rate limiting recommended for production (add Upstash Redis)

## License

MIT
