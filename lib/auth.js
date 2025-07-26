// Authentication utility functions

export const logout = async () => {
  try {
    // Get session token from cookie
    const sessionToken = getCookie('admin_session')
    
    if (sessionToken) {
      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionToken }),
      })
    }
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    // Clear session data
    document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    localStorage.removeItem('admin_user')
    
    // Redirect to login page
    window.location.href = '/'
  }
}

export const validateSession = async () => {
  try {
    const sessionToken = getCookie('admin_session')
    
    if (!sessionToken) {
      return { valid: false, user: null }
    }

    const response = await fetch('/api/auth/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionToken }),
    })

    const data = await response.json()
    
    if (response.ok && data.valid) {
      return { valid: true, user: data.user }
    } else {
      // Clear invalid session
      document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      localStorage.removeItem('admin_user')
      return { valid: false, user: null }
    }
  } catch (error) {
    console.error('Session validation error:', error)
    // Clear session on error
    document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    localStorage.removeItem('admin_user')
    return { valid: false, user: null }
  }
}

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('admin_user')
    return userStr ? JSON.parse(userStr) : null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export const isAuthenticated = () => {
  const sessionToken = getCookie('admin_session')
  return sessionToken && sessionToken.startsWith('admin_session_')
}

// Helper function to get cookie value
function getCookie(name) {
  if (typeof document === 'undefined') return null // Server-side check
  
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
} 