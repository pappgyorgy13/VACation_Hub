import { useState } from 'react'
import { clsx } from 'clsx'
import { Shield, Skull } from 'lucide-react'

export type BanCategory = 'REAL' | 'TROLL'

interface BanTypeToggleProps {
  value: BanCategory
  onChange: (value: BanCategory) => void
}

export function BanTypeToggle({ value, onChange }: BanTypeToggleProps) {
  return (
    <div className="inline-flex rounded-lg bg-cs2-gray p-1">
      <button
        onClick={() => onChange('REAL')}
        className={clsx(
          'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
          value === 'REAL'
            ? 'bg-vac-red text-white shadow-lg'
            : 'text-gray-400 hover:text-white'
        )}
      >
        <Shield className="h-4 w-4" />
        Real Bans
      </button>
      <button
        onClick={() => onChange('TROLL')}
        className={clsx(
          'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
          value === 'TROLL'
            ? 'bg-troll-purple text-white shadow-lg'
            : 'text-gray-400 hover:text-white'
        )}
      >
        <Skull className="h-4 w-4" />
        Troll Games
      </button>
    </div>
  )
}