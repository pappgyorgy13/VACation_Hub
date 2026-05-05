'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react'
import type { Ban, BanCategory } from '@/types'
import { BanTypeToggle } from './BanTypeToggle'

const banTypeLabels: Record<string, string> = {
  VAC: 'VAC Ban',
  GAME: 'Game Ban',
  OW: 'Overwatch Ban',
  TEAM_DAMAGE: 'Team Damage',
  TEAM_KILL: 'Team Kill',
  GRIEFING: 'Griefing',
  FAKE_REPORT: 'Fake Report',
}

export function BanCard({ ban, onVote, onComment }: { ban: Ban; onVote?: (id: string, v: boolean) => void; onComment?: (id: string) => void }) {
  return (
    <div className={clsx(
      'rounded-lg border p-4 transition-all',
      ban.category === 'REAL' ? 'border-vac-red/30 bg-vac-red/5' : 'border-troll-purple/30 bg-troll-purple/5'
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className={clsx(
              'rounded px-2 py-0.5 text-xs font-bold uppercase',
              ban.category === 'REAL' ? 'bg-vac-red text-white' : 'bg-troll-purple text-white'
            )}>
              {banTypeLabels[ban.ban_type] || ban.ban_type}
            </span>
            <span className="text-sm text-gray-400">
              {new Date(ban.created_at).toLocaleDateString()}
            </span>
          </div>
          <h3 className="mt-2 font-semibold text-white">{ban.username || 'Unknown Player'}</h3>
          <p className="mt-1 text-sm text-gray-400">Steam ID: {ban.steam_id}</p>
          {ban.evidence && <p className="mt-2 text-sm text-gray-300">{ban.evidence}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onVote?.(ban.id, true)}
            className="flex items-center gap-1 rounded-md bg-cs2-light px-2 py-1 text-sm text-green-400 hover:bg-green-400/20"
          >
            <ThumbsUp className="h-4 w-4" /> {ban.upvotes}
          </button>
          <button
            onClick={() => onVote?.(ban.id, false)}
            className="flex items-center gap-1 rounded-md bg-cs2-light px-2 py-1 text-sm text-red-400 hover:bg-red-400/20"
          >
            <ThumbsDown className="h-4 w-4" /> {ban.downvotes}
          </button>
          <button
            onClick={() => onComment?.(ban.id)}
            className="flex items-center gap-1 rounded-md bg-cs2-light px-2 py-1 text-sm text-gray-400 hover:text-white"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function BanList({ bans, category, onCategoryChange, onVote, onComment }: {
  bans: Ban[]; category: BanCategory; onCategoryChange: (c: BanCategory) => void; onVote?: (id: string, v: boolean) => void; onComment?: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          {category === 'REAL' ? 'Real Bans' : 'Troll Games'}
        </h2>
        <BanTypeToggle value={category} onChange={onCategoryChange} />
      </div>
      {bans.length === 0 ? (
        <div className="rounded-lg border border-dashed border-cs2-light p-8 text-center text-gray-500">
          No {category === 'REAL' ? 'bans' : 'troll games'} reported yet
        </div>
      ) : (
        <div className="space-y-3">
          {bans.map((ban) => (
            <BanCard key={ban.id} ban={ban} onVote={onVote} onComment={onComment} />
          ))}
        </div>
      )}
    </div>
  )
}