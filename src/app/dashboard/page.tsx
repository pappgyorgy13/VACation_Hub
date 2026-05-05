'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BanList } from '@/components/BanCard'
import { MatchList, SteamIdInput, PlayerStats } from '@/components/MatchCard'
import { Navbar } from '@/components/Navbar'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { Ban, Match, Profile } from '@/types'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [steamId, setSteamId] = useState('')
  const [myBans, setMyBans] = useState<Ban[]>([])
  const [myMatches, setMyMatches] = useState<Match[]>([])
  const [tab, setTab] = useState<'bans' | 'matches'>('bans')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      const bansPromise = supabase.from('bans').select('*, reporter:profiles(*), match:matches(*)').eq('reporter_id', session.user.id).order('created_at', { ascending: false })
      const matchesPromise = profileData?.steam_id
        ? supabase.from('matches').select('*').eq('steam_id', profileData.steam_id).order('date', { ascending: false })
        : Promise.resolve({ data: [] })

      const [bansRes, matchesRes] = await Promise.all([bansPromise, matchesPromise])

      if (profileData) {
        setProfile(profileData)
        setSteamId(profileData.steam_id || '')
      }
      if (bansRes.data) setMyBans(bansRes.data)
      if (matchesRes.data) setMyMatches(matchesRes.data)

      setLoading(false)
    }

    getUser()
  }, [router])

  const handleAddSteamId = async () => {
    if (!user || !steamId) return
    await supabase.from('profiles').update({ steam_id: steamId }).eq('id', user.id)
    setProfile({ ...profile!, steam_id: steamId })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cs2-dark">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cs2-dark">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-white">Dashboard</h1>

        <div className="mb-8">
          <PlayerStats
            steamId={profile?.steam_id || 'Not set'}
            username={profile?.username || user?.email?.split('@')[0]}
            banCount={myBans.length}
            matchCount={myMatches.length}
          />
        </div>

        {!profile?.steam_id && (
          <div className="mb-8 rounded-lg border border-cs2-orange/30 bg-cs2-orange/5 p-4">
            <p className="mb-3 text-white">Add your Steam ID to track matches:</p>
            <SteamIdInput value={steamId} onChange={setSteamId} onSubmit={handleAddSteamId} />
          </div>
        )}

        <div className="mb-6 flex gap-4 border-b border-cs2-light">
          <button
            onClick={() => setTab('bans')}
            className={`border-b-2 px-4 py-2 font-medium ${
              tab === 'bans' ? 'border-cs2-orange text-cs2-orange' : 'text-gray-400 hover:text-white'
            }`}
          >
            My Reported Bans ({myBans.length})
          </button>
          <button
            onClick={() => setTab('matches')}
            className={`border-b-2 px-4 py-2 font-medium ${
              tab === 'matches' ? 'border-cs2-orange text-cs2-orange' : 'text-gray-400 hover:text-white'
            }`}
          >
            My Matches ({myMatches.length})
          </button>
        </div>

        {tab === 'bans' ? (
          <BanList bans={myBans} category="REAL" onCategoryChange={() => {}} />
        ) : (
          <MatchList matches={myMatches} />
        )}
      </div>
    </div>
  )
}