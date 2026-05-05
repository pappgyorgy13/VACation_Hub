# CS2 Ban Tracker - SPEC.md

## Project Overview
- **Project Name**: CS2 Ban Tracker (like Leetify but focused on ban tracking)
- **Type**: Full-stack web application
- **Core Functionality**: Track and log CS2 player bans - both legitimate VAC/game bans AND troll games where players get their own teammates banned via team damage
- **Target Users**: CS2 players who want to track toxic players, griefers, and troll行为

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Supabase (Auth + PostgreSQL + Realtime)
- **Hosting**: GitHub Pages (via GitHub Actions)
- **API**: Steam Web API for match data

## Features

### 1. Authentication
- [x] Supabase Auth with email/password
- [x] GitHub OAuth sign-in option
- [x] User profile with Steam ID linking
- [x] Session management with JWT

### 2. Match Integration
- [x] Steam API integration to fetch CS2 matches
- [x] Match list display (like Leetify)
- [x] Match details with player roster
- [x] Automatic ban detection from match data

### 3. Ban Tracking System
- [x] Log VAC bans (real bans)
- [x] Log Game bans (real bans)
- [x] **Toggle Mode**: Switch between "Real Bans" and "Troll Games"
- [x] Troll Games mode: Log players who get teammates banned via team damage/kicking
- [x] Ban reason classification
- [x] Timestamps for all bans

### 4. Player Lookup
- [x] Search players by Steam ID or name
- [x] View player profile with ban history
- [x] View player's match history
- [x] Report new ban observations

### 5. Ban Types
```
REAL BANS (actual VAC/game bans):
- VAC Ban
- Game Ban
- Overwatch Ban

TROLL GAMES (griefing/team damage):
- Team Damage (friendly fire abuse)
- Team Kill (kicking teammates)
- Griefing (feeding enemy, blocking, etc.)
- Fake Ban Report (mass reporting innocent players)
```

### 6. User Interactions
- [x] Add matches via Steam ID
- [x] Log ban observations
- [x] Toggle between Real Bans / Troll Games view
- [x] Upvote/downvote ban reports
- [x] Comment on reported players

## Database Schema

### Tables

```sql
-- Users table (extends Supabase auth.users)
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT,
  steam_id TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Matches table
matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  steam_id TEXT NOT NULL,
  match_id TEXT NOT NULL UNIQUE,
  map TEXT,
  mode TEXT,
  duration INTEGER,
  date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Players in matches
match_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id),
  steam_id TEXT NOT NULL,
  username TEXT,
  team TEXT CHECK (team IN ('CT', 'T')),
  kills INTEGER,
  deaths INTEGER,
  assists INTEGER,
  adr REAL,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Bans table
bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  steam_id TEXT NOT NULL,
  username TEXT,
  ban_type TEXT CHECK (ban_type IN ('VAC', 'GAME', 'OW', 'TEAM_DAMAGE', 'TEAM_KILL', 'GRIEFING', 'FAKE_REPORT')),
  category TEXT CHECK (category IN ('REAL', 'TROLL')),
  reporter_id UUID REFERENCES profiles(id),
  match_id UUID REFERENCES matches(id),
  evidence TEXT,
  verified BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Vote tracking
ban_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ban_id UUID REFERENCES bans(id),
  user_id UUID REFERENCES profiles(id),
  vote BOOLEAN, -- true = upvote, false = downvote
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(ban_id, user_id)
)

-- Comments on bans
ban_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ban_id UUID REFERENCES bans(id),
  user_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Matches
- `GET /api/matches/[steamId]` - Fetch user's matches from Steam API
- `POST /api/matches` - Save a match to database
- `GET /api/matches/[id]` - Get match details

### Bans
- `GET /api/bans` - List bans (filterable by type, category)
- `POST /api/bans` - Report a new ban
- `GET /api/bans/[steamId]` - Get bans for a player
- `POST /api/bans/[id]/vote` - Upvote/downvote a ban
- `POST /api/bans/[id]/comments` - Add comment

### Profiles
- `GET /api/profiles/[steamId]` - Get player profile with stats
- `PATCH /api/profiles/[id]` - Update profile

## UI Components

### Pages
1. `/` - Landing page with toggle (Real Bans / Troll Games) + featured bans
2. `/login` - Sign in / Sign up
3. `/dashboard` - User's uploaded matches and reported bans
4. `/player/[steamId]` - Player profile with full ban history
5. `/browse` - Browse all bans with filters
6. `/match/[id]` - Match details with players

### Components
- `<BanCard>` - Displays a single ban with voting
- `<MatchCard>` - Displays match summary
- `<PlayerStats>` - Shows player statistics
- `<BanTypeToggle>` - Toggle between Real Bans / Troll Games
- `<SearchBar>` - Search players
- `<SteamIdInput>` - Input for Steam ID lookup
- `<VoteButtons>` - Upvote/downvote controls

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STEAM_API_KEY=
NEXT_PUBLIC_STEAM_API_KEY=
```

## Deployment
- GitHub Actions for CI/CD
- Vercel or GitHub Pages for hosting
- Supabase self-hosted or cloud instance