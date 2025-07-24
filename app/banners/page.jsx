"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { BannersManagement } from "@/components/banners-management"
import { LoginForm } from "@/components/login-form"

export default function BannersPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAuthenticated(localStorage.getItem("isAuthenticated") === "true")
    }
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
    if (typeof window !== "undefined") {
      localStorage.setItem("isAuthenticated", "true")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    if (typeof window !== "undefined") {
      localStorage.removeItem("isAuthenticated")
    }
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <AdminLayout onLogout={handleLogout}>
      <BannersManagement />
    </AdminLayout>
  )
}
