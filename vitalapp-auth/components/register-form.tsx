"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react"
import { authService } from "@/lib/auth"

export function RegisterForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)

    try {
      // 🔹 Llamada al backend para registrar un paciente
      await authService.register(
        formData.name,
        formData.email,
        formData.phone,
        formData.password,
        "patient"
      )

      // 🔹 Redirige al panel del paciente
      router.push("/patient")
    } catch (error) {
      console.error("Register error:", error)
      alert("Error al crear la cuenta. Verifica los datos.")
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        {/* 🔹 Nombre completo */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Nombre completo
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="Juan Pérez"
              value={formData.name}
              onChange={(e) => updateFormData("name", e.target.value)}
              className="pl-10 h-11"
              required
            />
          </div>
        </div>

        {/* 🔹 Correo electrónico */}
        <div className="space-y-2">
          <Label htmlFor="register-email" className="text-sm font-medium">
            Correo electrónico
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="register-email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => updateFormData("email", e.target.value)}
              className="pl-10 h-11"
              required
            />
          </div>
        </div>

        {/* 🔹 Teléfono */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Teléfono
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="+52 555 000 0000"
              value={formData.phone}
              onChange={(e) => updateFormData("phone", e.target.value)}
              className="pl-10 h-11"
              required
            />
          </div>
        </div>

        {/* 🔹 Contraseña */}
        <div className="space-y-2">
          <Label htmlFor="register-password" className="text-sm font-medium">
            Contraseña
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => updateFormData("password", e.target.value)}
              className="pl-10 pr-10 h-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 🔹 Confirmar contraseña */}
        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-sm font-medium">
            Confirmar contraseña
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => updateFormData("confirmPassword", e.target.value)}
              className="pl-10 pr-10 h-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 🔹 Aceptar términos */}
      <div className="flex items-start gap-3">
        <Checkbox
          id="terms"
          checked={formData.acceptTerms}
          onCheckedChange={(checked) => updateFormData("acceptTerms", checked as boolean)}
          className="mt-1"
          required
        />
        <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
          Acepto los{" "}
          <button type="button" className="text-primary hover:underline focus:outline-none focus:underline">
            términos y condiciones
          </button>{" "}
          y la{" "}
          <button type="button" className="text-primary hover:underline focus:outline-none focus:underline">
            política de privacidad
          </button>
        </label>
      </div>

      {/* 🔹 Botón enviar */}
      <Button
        type="submit"
        className="w-full h-11 text-base font-semibold"
        disabled={isLoading || !formData.acceptTerms}
      >
        {isLoading ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
    </form>
  )
}
