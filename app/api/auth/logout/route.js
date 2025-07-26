import { supabase } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { sessionToken } = await request.json()

    if (sessionToken) {
      // Remove session from database (optional)
      try {
        await supabase.from('admin_sessions').delete().eq('id', sessionToken)
      } catch (error) {
        console.warn('Could not remove session from database:', error.message)
        // Continue even if database is not available
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Logout successful'
    })

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
} 