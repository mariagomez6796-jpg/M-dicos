"use client"

export type UserRole = "patient" | "doctor" | "admin"

export interface User {
  email: string
  role: UserRole
  token: string
  name?: string
  phone?: string
}

export const authService = {
  // 🔹 LOGIN - se conecta al backend
  login: async (emailParam: string, password: string): Promise<User> => {
  const res = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailParam, password }),
    })

    if (!res.ok) {
      throw new Error("Credenciales incorrectas")
    }

    const data = await res.json()

    // data = { token, role, email }
    // Some backends return 'emailAddres' (typo) or 'emailAddress' instead of 'email'.
    const emailVar = data.email ?? data.emailAddres ?? data.emailAddress ?? ''
    const user: User = {
      email: emailVar,
      role: data.role.toLowerCase() as UserRole,
      token: data.token,
    }

    localStorage.setItem("user", JSON.stringify(user))
    return user
  },

  // 🔹 REGISTER - ejemplo (ajusta a tus endpoints reales)
  register: async (
    name: string,
    email: string,
    phone: string,
    password: string,
    role: UserRole
  ): Promise<User> => {
  const res = await fetch(`/api/v1/${role}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // send expected keys: name, email, phone, password
      body: JSON.stringify({ name, emailAddress: email, phone, password }),
    })

    if (!res.ok) {
      // Try to parse server message for a clearer error
      const err = await res.json().catch(() => null)
      const msg = err?.message || 'Error al registrar usuario'
      throw new Error(msg)
    }

    // Después del registro, logueamos automáticamente
    return await authService.login(email, password)
  },

  // 🔹 LOGOUT
  logout: () => {
    localStorage.removeItem("user")
  },

  // 🔹 Obtener usuario actual
  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null
    const userStr = localStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  },
}
