-- CS2 Ban Tracker Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  steam_id TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Matches table
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  steam_id TEXT NOT NULL,
  match_id TEXT NOT NULL UNIQUE,
  map TEXT,
  mode TEXT,
  duration INTEGER,
  date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on matches
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view matches" ON public.matches
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert matches" ON public.matches
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Players in matches
CREATE TABLE IF NOT EXISTS public.match_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  steam_id TEXT NOT NULL,
  username TEXT,
  team TEXT CHECK (team IN ('CT', 'T')),
  kills INTEGER,
  deaths INTEGER,
  assists INTEGER,
  adr REAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on match_players
ALTER TABLE public.match_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view match players" ON public.match_players
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert match players" ON public.match_players
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Bans table
CREATE TABLE IF NOT EXISTS public.bans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  steam_id TEXT NOT NULL,
  username TEXT,
  ban_type TEXT CHECK (ban_type IN ('VAC', 'GAME', 'OW', 'TEAM_DAMAGE', 'TEAM_KILL', 'GRIEFING', 'FAKE_REPORT')),
  category TEXT CHECK (category IN ('REAL', 'TROLL')) NOT NULL,
  reporter_id UUID REFERENCES public.profiles(id),
  match_id UUID REFERENCES public.matches(id),
  evidence TEXT,
  verified BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on bans
ALTER TABLE public.bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bans" ON public.bans
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert bans" ON public.bans
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own bans" ON public.bans
  FOR UPDATE USING (auth.uid() = reporter_id);

-- Vote tracking
CREATE TABLE IF NOT EXISTS public.ban_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ban_id UUID REFERENCES public.bans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  vote BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ban_id, user_id)
);

-- Enable RLS on ban_votes
ALTER TABLE public.ban_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view votes" ON public.ban_votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert votes" ON public.ban_votes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own votes" ON public.ban_votes
  FOR UPDATE USING (auth.uid() = user_id);

-- Comments on bans
CREATE TABLE IF NOT EXISTS public.ban_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ban_id UUID REFERENCES public.bans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on ban_comments
ALTER TABLE public.ban_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON public.ban_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments" ON public.ban_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own comments" ON public.ban_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bans_steam_id ON public.bans(steam_id);
CREATE INDEX IF NOT EXISTS idx_bans_category ON public.bans(category);
CREATE INDEX IF NOT EXISTS idx_bans_created_at ON public.bans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_steam_id ON public.matches(steam_id);
CREATE INDEX IF NOT EXISTS idx_match_players_match_id ON public.match_players(match_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();