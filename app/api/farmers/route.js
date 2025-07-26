import { supabase } from '@/lib/supabaseClient'

export async function GET() {
  try {
    const { data, error } = await supabase.from('farmers').select('*')
    if (error) {
      console.error('Supabase error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }
    return Response.json(data || [])
  } catch (error) {
    console.error('API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    // If joinDate is not provided, set it to today
    const farmerToInsert = {
      ...body,
      joinDate: body.joinDate || new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    }
    const { data, error } = await supabase.from('farmers').insert([farmerToInsert]).select().single()
    if (error) {
      console.error('Supabase error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }
    return Response.json(data, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, ...fields } = body
    const { data, error } = await supabase.from('farmers').update(fields).eq('id', id).select().single()
    if (error) {
      console.error('Supabase error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }
    return Response.json(data)
  } catch (error) {
    console.error('API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json()
    const { data, error } = await supabase.from('farmers').delete().eq('id', id).select().single()
    if (error) {
      console.error('Supabase error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }
    return Response.json(data)
  } catch (error) {
    console.error('API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
} 