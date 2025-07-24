"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { NewsSection } from "@/components/news-section"
import { LoginForm } from "@/components/login-form"

export default function NewsPage() {
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
      <NewsSection />
    </AdminLayout>
  )
}
