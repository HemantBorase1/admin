import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET() {
  const { data, error } = await supabase.from('farmers').select('*')
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(request) {
  const body = await request.json()
  // If joinDate is not provided, set it to today
  const farmerToInsert = {
    ...body,
    joinDate: body.joinDate || new Date().toISOString().slice(0, 10), // YYYY-MM-DD
  }
  const { data, error } = await supabase.from('farmers').insert([farmerToInsert]).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}

export async function PUT(request) {
  const body = await request.json()
  const { id, ...fields } = body
  const { data, error } = await supabase.from('farmers').update(fields).eq('id', id).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(request) {
  const { id } = await request.json()
  const { data, error } = await supabase.from('farmers').delete().eq('id', id).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
} 