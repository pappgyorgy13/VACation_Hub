import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: (await request.json()).email,
      password: (await request.json()).password,
    })

    if (error) throw error

    return Response.json(data)
  } catch (error) {
    console.error('Error signing up:', error)
    return Response.json({ error: 'Failed to sign up' }, { status: 500 })
  }
}