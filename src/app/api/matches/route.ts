import { createClient } from '@supabase/supabase-js'

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null

export async function POST(request: Request) {
  if (!supabase) {
    return Response.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  try {
    const { steam_id, match_id, map, mode, duration, date, players } = await request.json()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .insert({
        steam_id,
        match_id,
        map,
        mode,
        duration,
        date,
      })
      .select()
      .single()

    if (matchError) throw matchError

    if (players && players.length > 0) {
      const playersWithMatchId = players.map((player: any) => ({
        ...player,
        match_id: matchData.id,
      }))

      await supabase.from('match_players').insert(playersWithMatchId)
    }

    return Response.json(matchData)
  } catch (error) {
    console.error('Error creating match:', error)
    return Response.json({ error: 'Failed to create match' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  if (!supabase) {
    return Response.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const steam_id = searchParams.get('steam_id')

    if (!steam_id) {
      return Response.json({ error: 'steam_id is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('steam_id', steam_id)
      .order('date', { ascending: false })

    if (error) throw error

    return Response.json(data)
  } catch (error) {
    console.error('Error fetching matches:', error)
    return Response.json({ error: 'Failed to fetch matches' }, { status: 500 })
  }
}