import { createClient } from '@supabase/supabase-js'

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  : null

export async function POST(request: Request) {
  if (!supabase) return Response.json({ error: 'Server misconfigured' }, { status: 500 })
  try {
    const { email, password } = await request.json()
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return Response.json(data)
  } catch (error) {
    return Response.json({ error: 'Failed to sign up' }, { status: 500 })
  }
}