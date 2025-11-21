"use client"

import { useState } from "react"
import {LoginForm}  from "./login-form"
import { RegisterForm } from "./register-form"
import { HeartPulse } from "lucide-react"

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Title */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="bg-primary rounded-xl p-3">
                <HeartPulse className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">VitalApp</h1>
            </div>
            <h2 className="text-2xl font-semibold text-foreground text-balance">
              {isLogin ? "Bienvenido de nuevo" : "Crea tu cuenta"}
            </h2>
            <p className="text-muted-foreground text-pretty">
              {isLogin
                ? "Ingresa tus credenciales para acceder a tu cuenta"
                : "Completa el formulario para comenzar a gestionar tus citas médicas"}
            </p>
          </div>

          {/* Form */}
          {isLogin ? <LoginForm /> : <RegisterForm />}

          {/* Toggle between login and register */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-semibold hover:underline focus:outline-none focus:underline"
              >
                {isLogin ? "Regístrate aquí" : "Inicia sesión"}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.08),transparent_50%)]" />

        <div className="relative z-10 max-w-lg space-y-8 text-primary-foreground">
          <div className="space-y-4">
            <h3 className="text-4xl font-bold text-balance leading-tight">Tu salud, nuestra prioridad</h3>
            <p className="text-lg text-primary-foreground/90 text-pretty leading-relaxed">
              Gestiona tus citas médicas de forma simple y eficiente. Accede a tu historial, programa consultas y mantén
              el control de tu salud en un solo lugar.
            </p>
          </div>

          <div className="space-y-4 pt-8">
            <div className="flex items-start gap-4">
              <div className="bg-primary-foreground/20 rounded-lg p-2 mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Agenda rápida</h4>
                <p className="text-sm text-primary-foreground/80">
                  Programa tus citas en segundos con nuestro sistema intuitivo
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-primary-foreground/20 rounded-lg p-2 mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Recordatorios automáticos</h4>
                <p className="text-sm text-primary-foreground/80">
                  Nunca olvides una cita con nuestras notificaciones inteligentes
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-primary-foreground/20 rounded-lg p-2 mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Historial completo</h4>
                <p className="text-sm text-primary-foreground/80">
                  Accede a todo tu historial médico cuando lo necesites
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
