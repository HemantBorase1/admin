import { supabase } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // For demo purposes, using hardcoded admin credentials
    // In production, you should store these in environment variables or database
    const validCredentials = {
      'admin@agripanel.com': 'Admin@123',
      'superadmin@agripanel.com': 'SuperAdmin@123',
      'admin@admin.com': 'admin123'
    }

    // Check if credentials are valid
    if (!validCredentials[email] || validCredentials[email] !== password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate a simple session token (in production, use JWT)
    const sessionToken = `admin_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create session data
    const sessionData = {
      id: sessionToken,
      username: email.split('@')[0], // Extract username from email
      role: email.includes('superadmin') ? 'superadmin' : 'admin',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    }

    // Store session in Supabase (optional - for session management)
    try {
      await supabase.from('admin_sessions').insert([sessionData])
    } catch (error) {
      console.warn('Could not store session in database:', error.message)
      // Continue without storing session if database is not available
    }

    // Return success response with session token
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        username: email.split('@')[0],
        email: email,
        role: email.includes('superadmin') ? 'superadmin' : 'admin'
      },
      sessionToken: sessionToken,
      expiresAt: sessionData.expiresAt
    })

  } catch (error) {
    console.error('Login error:', error)
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