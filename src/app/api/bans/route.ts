import { createClient } from '@supabase/supabase-js'

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null

export async function POST(request: Request) {
  if (!supabase) {
    return Response.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  try {
    const { steam_id, username, ban_type, category, evidence, match_id } = await request.json()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('bans')
      .insert({
        steam_id,
        username,
        ban_type,
        category,
        evidence,
        match_id,
        reporter_id: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return Response.json(data)
  } catch (error) {
    console.error('Error creating ban:', error)
    return Response.json({ error: 'Failed to create ban' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  if (!supabase) {
    return Response.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = searchParams.get('limit') || '50'

    let query = supabase
      .from('bans')
      .select('*, reporter:profiles(*), match:matches(*)')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit))

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) throw error

    return Response.json(data)
  } catch (error) {
    console.error('Error fetching bans:', error)
    return Response.json({ error: 'Failed to fetch bans' }, { status: 500 })
  }
}