"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Dashboard } from "@/components/dashboard"
import { LoginForm } from "@/components/login-form"
import { isAuthenticated, validateSession } from "@/lib/auth"

export default function Home() {
  const [isAuth, setIsAuth] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        if (isAuthenticated()) {
          // Validate session with server
          const { valid } = await validateSession()
          if (valid) {
            setIsAuth(true)
            // Only redirect if we're on the root path
            if (window.location.pathname === '/') {
              router.push('/dashboard')
            }
          } else {
            setIsAuth(false)
          }
        } else {
          setIsAuth(false)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setIsAuth(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuth) {
    return <LoginForm />
  }

  return (
    <AdminLayout>
      <Dashboard />
    </AdminLayout>
  )
}
