"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Dashboard } from "@/components/dashboard"
import { isAuthenticated, validateSession } from "@/lib/auth"


export default function DashboardPage() {
  const [isAuth, setIsAuth] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          const { valid } = await validateSession()
          if (valid) {
            setIsAuth(true)
          } else {
            // Clear invalid session and redirect to login
            router.push('/')
          }
        } else {
          router.push('/')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/')
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
    return null
  }

  return (
    <AdminLayout>
      <Dashboard />
    </AdminLayout>
  )
} 