'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <nav className="border-b border-cs2-light">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cs2-orange text-xl font-bold text-white">
            CS2
          </div>
          <span className="text-xl font-bold text-white">Ban Tracker</span>
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-400">{user.email}</span>
              <button
                onClick={signOut}
                className="rounded-lg bg-cs2-light px-4 py-2 text-sm text-white hover:bg-gray-700"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-cs2-orange px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}