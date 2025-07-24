"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Dashboard } from "@/components/dashboard"
import { LoginForm } from "@/components/login-form"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("isAuthenticated") === "true"
    }
    return false
  })

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
    <AdminLayout onLogout={() => handleLogout()}>
      <Dashboard />
    </AdminLayout>
  )
}
