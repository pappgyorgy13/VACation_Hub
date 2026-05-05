'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { BanList } from '@/components/BanCard'
import { SteamIdInput } from '@/components/MatchCard'
import { Navbar } from '@/components/Navbar'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { BanTypeToggle, BanCategory } from '@/components/BanTypeToggle'
import type { Ban } from '@/types'

export default function Home() {
  const [category, setCategory] = useState<BanCategory>('REAL')
  const [bans, setBans] = useState<Ban[]>([])
  const [loading, setLoading] = useState(true)
  const [steamId, setSteamId] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    fetchBans()
  }, [category])

  const fetchBans = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('bans')
      .select('*, reporter:profiles(*), match:matches(*)')
      .eq('category', category)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) {
      setBans(data)
    }
    setLoading(false)
  }

  const handleVote = async (banId: string, vote: boolean) => {
    if (!user) {
      alert('Please sign in to vote')
      return
    }

    await supabase.from('ban_votes').insert({
      ban_id: banId,
      user_id: user.id,
      vote,
    })

    setBans(prev => prev.map(b =>
      b.id === banId
        ? { ...b, upvotes: vote ? b.upvotes + 1 : b.upvotes, downvotes: !vote ? b.downvotes + 1 : b.downvotes }
        : b
    ))
  }

  const handleSearch = () => {
    if (steamId) {
      window.location.href = `/player?steamId=${encodeURIComponent(steamId)}`
    }
  }

  return (
    <main className="min-h-screen bg-cs2-dark">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">
            Track <span className="text-cs2-orange">CS2</span> Bans
          </h1>
          <p className="mb-8 text-lg text-gray-400">
            Log VAC bans, game bans, and troll games. Help the community identify toxic players.
          </p>
          <div className="mb-8 flex justify-center">
            <BanTypeToggle value={category} onChange={setCategory} />
          </div>
          <div className="mx-auto max-w-xl">
            <SteamIdInput
              value={steamId}
              onChange={setSteamId}
              onSubmit={handleSearch}
            />
          </div>
        </section>
        <section>
          <h2 className="mb-6 text-2xl font-bold text-white">
            Recent {category === 'REAL' ? 'Bans' : 'Troll Games'}
          </h2>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <BanList
              bans={bans}
              category={category}
              onCategoryChange={setCategory}
              onVote={handleVote}
            />
          )}
        </section>
      </div>
    </main>
  )
}