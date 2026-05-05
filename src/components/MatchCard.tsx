'use client'

import { Search, User, Clock, MapPin } from 'lucide-react'
import type { Match } from '@/types'

export function MatchCard({ match, onClick }: { match: Match; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-cs2-light bg-cs2-gray p-4 transition-all hover:border-cs2-orange hover:shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cs2-orange text-lg font-bold text-white">
            {match.map?.substring(0, 2) || 'CS'}
          </div>
          <div>
            <p className="font-semibold text-white">{match.map || 'Unknown Map'}</p>
            <div className="mt-1 flex items-center gap-3 text-sm text-gray-400">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{match.mode || 'Competitive'}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{match.duration ? `${Math.floor(match.duration / 60)} min` : 'Unknown'}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">{new Date(match.date).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}

export function MatchList({ matches, onMatchClick }: { matches: Match[]; onMatchClick?: (id: string) => void }) {
  if (matches.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-cs2-light p-8 text-center text-gray-500">
        No matches found. Add your Steam ID to get started.
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} onClick={() => onMatchClick?.(match.id)} />
      ))}
    </div>
  )
}

export function SteamIdInput({ value, onChange, onSubmit, loading }: { value: string; onChange: (v: string) => void; onSubmit: () => void; loading?: boolean }) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) onSubmit()
  }
  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter Steam ID (e.g., 76561198012345678)"
          className="w-full rounded-lg border border-cs2-light bg-cs2-gray py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:border-cs2-orange focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="rounded-lg bg-cs2-orange px-6 py-3 font-medium text-white hover:bg-orange-600 disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Search'}
      </button>
    </form>
  )
}

export function PlayerStats({ steamId, username, banCount = 0, matchCount = 0 }: { steamId: string; username?: string; banCount?: number; matchCount?: number }) {
  return (
    <div className="flex items-center gap-6 rounded-lg border border-cs2-light bg-cs2-gray p-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cs2-orange text-xl font-bold text-white">
        <User className="h-8 w-8" />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-white">{username || 'Unknown Player'}</h3>
        <p className="text-sm text-gray-400">Steam ID: {steamId}</p>
      </div>
      <div className="flex gap-6 text-center">
        <div>
          <p className="text-2xl font-bold text-vac-red">{banCount}</p>
          <p className="text-xs text-gray-400">Bans Reported</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-cs2-orange">{matchCount}</p>
          <p className="text-xs text-gray-400">Matches</p>
        </div>
      </div>
    </div>
  )
}