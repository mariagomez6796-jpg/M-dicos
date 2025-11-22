"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService, type User } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { HeartPulse, LogOut } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  allowedRoles: Array<"patient" | "doctor" | "admin">
}

export function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()

    if (!currentUser) {
      router.push("/")
      return
    }
      // Normalizar el rol a minúsculas para la comparación
    const normalizedRole = currentUser.role.toLowerCase();
  if (!allowedRoles.includes(normalizedRole as any)) {
  router.push("/");
  return;
  }

    setUser({ ...currentUser, role: normalizedRole as any })
    setIsLoading(false)
  }, [router, allowedRoles])

  const handleLogout = () => {
    authService.logout()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-lg p-2">
              <HeartPulse className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">VitalApp</h1>
              <p className="text-xs text-muted-foreground">
                {user.role === "admin" && "Panel de Administrador"}
                {user.role === "doctor" && "Panel de Doctor"}
                {user.role === "patient" && "Panel de Paciente"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}
