'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BanList } from '@/components/BanCard'
import { MatchList, PlayerStats } from '@/components/MatchCard'
import { Navbar } from '@/components/Navbar'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { BanTypeToggle, BanCategory } from '@/components/BanTypeToggle'
import type { Ban, Match, Profile } from '@/types'

function PlayerContent() {
  const searchParams = useSearchParams()
  const steamId = searchParams.get('steamId') || ''
  const [profile, setProfile] = useState<Profile | null>(null)
  const [bans, setBans] = useState<Ban[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [category, setCategory] = useState<BanCategory>('REAL')
  const [tab, setTab] = useState<'bans' | 'matches'>('bans')

  useEffect(() => {
    if (!steamId) return

    const fetchData = async () => {
      const [profileRes, bansRes, matchesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('steam_id', steamId).single(),
        supabase.from('bans').select('*, reporter:profiles(*), match:matches(*)').eq('steam_id', steamId).eq('category', category).order('created_at', { ascending: false }),
        supabase.from('matches').select('*').eq('steam_id', steamId).order('date', { ascending: false })
      ])

      if (profileRes.data) setProfile(profileRes.data)
      if (bansRes.data) setBans(bansRes.data)
      if (matchesRes.data) setMatches(matchesRes.data)
    }

    fetchData()
  }, [steamId, category])

  if (!steamId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cs2-dark">
        <p className="text-gray-400">No Steam ID provided</p>
      </div>
    )
  }

  return (
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
  )
}

export default function PlayerPage() {
  return (
    <div className="min-h-screen bg-cs2-dark">
      <Navbar />
      <Suspense fallback={<LoadingSpinner />}>
        <PlayerContent />
      </Suspense>
    </div>
  )
}