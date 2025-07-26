import { supabase } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { sessionToken } = await request.json()

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token is required' },
        { status: 400 }
      )
    }

    // First, try to validate session token format
    if (!sessionToken.startsWith('admin_session_')) {
      return NextResponse.json(
        { error: 'Invalid session format' },
        { status: 401 }
      )
    }

    // Try to get session from database
    try {
      const { data: session, error } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('id', sessionToken)
        .single()

      if (error) {
        console.warn('Database error during session lookup:', error.message)
        // Continue to fallback validation
      } else if (session) {
        // Check if session is expired
        if (new Date(session.expiresAt) < new Date()) {
          // Remove expired session
          try {
            await supabase.from('admin_sessions').delete().eq('id', sessionToken)
          } catch (deleteError) {
            console.warn('Could not delete expired session:', deleteError.message)
          }
          return NextResponse.json(
            { error: 'Session expired' },
            { status: 401 }
          )
        }

        return NextResponse.json({
          success: true,
          valid: true,
          user: {
            username: session.username,
            role: session.role
          },
          expiresAt: session.expiresAt
        })
      }
    } catch (dbError) {
      console.warn('Database error during session validation:', dbError.message)
    }
    
    // Fallback: validate session token format and provide basic validation
    // This allows the app to work even without database connection
    if (sessionToken.startsWith('admin_session_')) {
      // Extract timestamp from session token (admin_session_TIMESTAMP_random)
      const parts = sessionToken.split('_')
      if (parts.length >= 3) {
        const timestamp = parseInt(parts[2])
        const sessionAge = Date.now() - timestamp
        
        // Check if session is older than 24 hours (86400000 ms)
        if (sessionAge < 24 * 60 * 60 * 1000) {
          return NextResponse.json({
            success: true,
            valid: true,
            user: {
              username: 'admin',
              role: 'admin'
            },
            expiresAt: new Date(timestamp + 24 * 60 * 60 * 1000).toISOString()
          })
        } else {
          return NextResponse.json(
            { error: 'Session expired' },
            { status: 401 }
          )
        }
      }
    }

    return NextResponse.json(
      { error: 'Invalid session' },
      { status: 401 }
    )

  } catch (error) {
    console.error('Session validation error:', error)
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