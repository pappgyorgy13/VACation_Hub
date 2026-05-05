'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BanList } from '@/components/BanCard'
import { MatchList, PlayerStats } from '@/components/MatchCard'
import { BanTypeToggle, BanCategory } from '@/components/BanTypeToggle'
import type { Ban, Match, Profile } from '@/types'

export default function PlayerPage() {
  const params = useParams()
  const steamId = params.steamId as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [bans, setBans] = useState<Ban[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [category, setCategory] = useState<BanCategory>('REAL')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'bans' | 'matches'>('bans')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('steam_id', steamId)
        .single()

      if (profileData) setProfile(profileData)

      const { data: bansData } = await supabase
        .from('bans')
        .select('*, reporter:profiles(*), match:matches(*)')
        .eq('steam_id', steamId)
        .eq('category', category)
        .order('created_at', { ascending: false })

      if (bansData) setBans(bansData)

      const { data: matchesData } = await supabase
        .from('matches')
        .select('*')
        .eq('steam_id', steamId)
        .order('date', { ascending: false })

      if (matchesData) setMatches(matchesData)

      setLoading(false)
    }

    fetchData()
  }, [steamId, category])

  return (
    <div className="min-h-screen bg-cs2-dark">
      <nav className="border-b border-cs2-light">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cs2-orange text-xl font-bold text-white">
              CS2
            </div>
            <span className="text-xl font-bold text-white">Ban Tracker</span>
          </a>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <PlayerStats
          steamId={steamId}
          username={profile?.username}
          banCount={bans.length}
          matchCount={matches.length}
        />

        <div className="mb-6 mt-8 flex gap-4 border-b border-cs2-light">
          <button
            onClick={() => setTab('bans')}
            className={`border-b-2 px-4 py-2 font-medium ${
              tab === 'bans' ? 'border-cs2-orange text-cs2-orange' : 'text-gray-400 hover:text-white'
            }`}
          >
            Bans ({bans.length})
          </button>
          <button
            onClick={() => setTab('matches')}
            className={`border-b-2 px-4 py-2 font-medium ${
              tab === 'matches' ? 'border-cs2-orange text-cs2-orange' : 'text-gray-400 hover:text-white'
            }`}
          >
            Matches ({matches.length})
          </button>
        </div>

        {tab === 'bans' ? (
          <BanList bans={bans} category={category} onCategoryChange={setCategory} />
        ) : (
          <MatchList matches={matches} />
        )}
      </div>
    </div>
  )
}