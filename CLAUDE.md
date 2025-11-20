# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multi-Sport Competition is a React + Vite application for managing sports competitions. It uses Supabase for authentication, database, and file storage. The application allows organizers to create competitions, manage participants, track results, and communicate with participants.

## Development Commands

```bash
# Navigate to the application directory
cd multi-sport-competition

# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Configure Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Set up Supabase database and storage:
   - Run the SQL script in `SUPABASE_SETUP.md` to create tables, RLS policies, and triggers
   - Run `STORAGE_BUCKET_SETUP.sql` to configure the `competition-files` storage bucket

## Architecture

### Project Structure

```
multi-sport-competition/
├── src/
│   ├── components/       # Reusable UI components (Header, Footer, Sidebar, etc.)
│   ├── pages/           # Page-level components (Login, Register, Dashboard, CompetitionDetails)
│   ├── services/        # API interaction layer (competitionService, profileService)
│   ├── lib/            # Third-party integrations (supabase client)
│   ├── utils/          # Utility functions (auth helpers)
│   ├── App.jsx         # Main routing configuration
│   └── main.jsx        # Application entry point
├── public/             # Static assets
└── SUPABASE_SETUP.md   # Database schema and setup instructions
```

### Key Architectural Patterns

**Service Layer Pattern**: All Supabase interactions go through service modules (`competitionService.js`, `profileService.js`). Never call Supabase directly from components - always use these service functions.

**Authentication Flow**:
- Authentication is centralized in `src/lib/supabase.js` with helper functions exported as `auth` object
- Session management uses `supabase.auth.onAuthStateChange()` listener in Dashboard
- Protected routes check for session and redirect to `/login` if not authenticated
- User profiles are automatically created via database trigger (`handle_new_user()`) when users sign up

**Profile Management**:
- `ensureUserProfile()` from `profileService.js` should be called after authentication to verify/create user profile
- Profile creation fallback exists in case the database trigger fails

**File Upload Pattern**:
- Files are uploaded to Supabase Storage bucket `competition-files`
- File paths follow pattern: `{user_id}/{timestamp}.{extension}` or `{user_id}/cover-{competition_id}.{extension}`
- File metadata is stored in `competition_files` table
- Max file size: 5MB per file

### Database Schema Key Points

**Tables**:
- `profiles`: User profiles linked to `auth.users` (1:1 relationship)
- `competitions`: Competition events with organizer relationship
- `participants`: Join table for competition registrations (competition + user)
- `competition_files`: File metadata for competition documents/images
- `results`: Competition results linked to participants
- `messages`: Direct messaging between users

**Important Triggers**:
- `handle_new_user()`: Auto-creates profile when user signs up
- `update_competition_participant_count()`: Maintains `current_participants` count automatically when registration status changes to/from 'confirmed'
- `update_updated_at_column()`: Auto-updates `updated_at` timestamps

**Row Level Security (RLS)**:
- All tables have RLS enabled
- Users can only view/edit their own profiles
- Competitions are publicly viewable but only editable by organizers
- Participants can view other participants in competitions they're involved in
- Only organizers can manage results for their competitions

### Routing Structure

- `/` - Landing page with public competition listings
- `/login` - Login page
- `/register` - Registration page
- `/dashboard/*` - Protected dashboard with nested routes:
  - `/dashboard/profile` - User profile view
  - `/dashboard/competitions` - Competition management
  - `/dashboard/participants` - Participant management
  - `/dashboard/availability` - Availability tracking
  - `/dashboard/results` - Results management
  - `/dashboard/stats` - Statistics dashboard
  - `/dashboard/messages` - Messaging system
  - `/dashboard/settings` - User settings
- `/competition/:id` - Public competition details page

## Working with Competitions

### Creating Competitions

Use `createCompetitionWithFiles()` which handles both competition creation and file uploads in a transaction-like manner:

```javascript
import { createCompetitionWithFiles } from '../services/competitionService'

const competitionData = {
  name: "Tournament Name",
  sport: "Tennis",
  date: "2025-06-15",
  description: "Optional description",
  address: "123 Street Name",
  city: "Paris",
  postalCode: "75001",
  maxParticipants: 32,
  ageCategory: "both", // "minors" | "adults" | "both"
  isOfficial: false
}

const files = [/* file objects */]

const { data, error } = await createCompetitionWithFiles(competitionData, files)
```

### Fetching Competitions

- `getUserCompetitions()`: Get competitions organized by current user
- `getAllCompetitions(filters)`: Get all public competitions with optional filters (sport, city, status, ageCategory)
- `getCompetitionById(id)`: Get single competition with organizer, files, and participants

## Common Patterns

### Error Handling

Services return `{ data, error }` pattern. Always check for errors:

```javascript
const { data, error } = await getUserCompetitions()
if (error) {
  // Handle error
  console.error(error)
  return
}
// Use data
```

### Loading States

Components managing async data should handle three states:
1. Loading (show spinner)
2. Error (show error message)
3. Success (show data or empty state)

See `CompetitionsView` component for reference implementation.

### Authentication State

Check authentication in `useEffect` with cleanup:

```javascript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    // Handle auth state
  })
  return () => subscription.unsubscribe()
}, [])
```

## Supabase Queries

### Relationships

Use Supabase's relation syntax for joins:

```javascript
// Get competition with organizer profile
.select(`
  *,
  profiles!competitions_organizer_id_fkey (
    id,
    full_name,
    avatar_url
  )
`)

// Get competition with nested participants and their profiles
.select(`
  *,
  participants (
    *,
    profiles (full_name, avatar_url)
  )
`)
```

### Foreign Key Naming

When selecting related data, use the foreign key constraint name:
- `profiles!competitions_organizer_id_fkey` for organizer relationship
- Check Supabase dashboard for exact constraint names if uncertain

## Important Notes

- The main application code is in `multi-sport-competition/` subdirectory, not the repository root
- File uploads must be done by authenticated users only
- Always call `ensureUserProfile()` after authentication and before creating competitions
- The `current_participants` field is automatically maintained by triggers - do not update manually
- Competition status values: `upcoming`, `ongoing`, `completed`, `cancelled`
- Registration status values: `pending`, `confirmed`, `cancelled`, `rejected`
- Age category values: `minors`, `adults`, `both`
