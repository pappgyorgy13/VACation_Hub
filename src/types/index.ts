export type BanType = 'VAC' | 'GAME' | 'OW' | 'TEAM_DAMAGE' | 'TEAM_KILL' | 'GRIEFING' | 'FAKE_REPORT'
export type BanCategory = 'REAL' | 'TROLL'

export interface Profile {
  id: string
  username: string
  steam_id: string
  avatar_url: string
  created_at: string
}

export interface Match {
  id: string
  steam_id: string
  match_id: string
  map: string
  mode: string
  duration: number
  date: string
  created_at: string
}

export interface MatchPlayer {
  id: string
  match_id: string
  steam_id: string
  username: string
  team: 'CT' | 'T'
  kills: number
  deaths: number
  assists: number
  adr: number
}

export interface Ban {
  id: string
  steam_id: string
  username: string
  ban_type: BanType
  category: BanCategory
  reporter_id: string
  match_id?: string
  evidence?: string
  verified: boolean
  upvotes: number
  downvotes: number
  created_at: string
  reporter?: Profile
  match?: Match
}

export interface BanVote {
  id: string
  ban_id: string
  user_id: string
  vote: boolean
  created_at: string
}

export interface BanComment {
  id: string
  ban_id: string
  user_id: string
  content: string
  created_at: string
  user?: Profile
}