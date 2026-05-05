'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { BanList } from '@/components/BanCard'
import { SteamIdInput, PlayerStats } from '@/components/MatchCard'
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

    const { error } = await supabase.from('ban_votes').insert({
      ban_id: banId,
      user_id: user.id,
      vote,
    })

    if (!error) {
      fetchBans()
    }
  }

  const handleSearch = () => {
    if (steamId) {
      window.location.href = `/player/${steamId}`
    }
  }

  return (
    <main className="min-h-screen bg-cs2-dark">
      <nav className="border-b border-cs2-light">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cs2-orange text-xl font-bold text-white">
              CS2
            </div>
            <span className="text-xl font-bold text-white">Ban Tracker</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-400">{user.email}</span>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="rounded-lg bg-cs2-light px-4 py-2 text-sm text-white hover:bg-gray-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <a
                href="/login"
                className="rounded-lg bg-cs2-orange px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
              >
                Sign In
              </a>
            )}
          </div>
        </div>
      </nav>

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
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-cs2-orange border-t-transparent" />
            </div>
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