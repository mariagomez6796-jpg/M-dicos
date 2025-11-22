"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Video, Plus, Copy, Calendar, Clock, User, ExternalLink } from "lucide-react"
import { authService } from "@/lib/auth"
import { createRoom } from "@/lib/video"
import { useRouter } from "next/navigation"


const mockVideoSessions = [
  {
    id: "1",
    patient: "Juan Pérez",
    date: "2024-01-25",
    time: "15:00",
    duration: "30 min",
    roomId: "vital-room-abc123",
    status: "scheduled",
  },
  {
    id: "2",
    patient: "María López",
    date: "2024-01-26",
    time: "10:00",
    duration: "45 min",
    roomId: "vital-room-def456",
    status: "scheduled",
  },
]

const statusConfig = {
  scheduled: { label: "Programada", variant: "secondary" as const },
  active: { label: "En curso", variant: "default" as const },
  completed: { label: "Completada", variant: "outline" as const },
}

export function VideoCallManager() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const router = useRouter()


  const copyRoomId = (roomId: string) => {
    navigator.clipboard.writeText(roomId)
    alert("ID de sala copiado al portapapeles")
  }

  const handleCreateRoom = async () => {
    try {
      const user = authService.getCurrentUser()
      if (!user?.token) {
        alert("Inicia sesión para crear una sala")
        return
      }
      const res = await createRoom(user.token)
      try { await navigator.clipboard.writeText(res.code) } catch {}
      alert(`Sala creada: ${res.code} (copiado al portapapeles)`)
      setIsCreateDialogOpen(false)
    } catch (e: any) {
      alert(e?.message || "Error al crear la sala")
    }
  }

  const handleJoin = () => {
    const code = joinCode.trim()
    if (!code) {
      alert("Ingresa el ID de sala")
      return
    }
    router.push(`/call/${encodeURIComponent(code)}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Videollamadas</h2>
          <p className="text-muted-foreground">Crea y únete a sesiones de videollamada con tus pacientes</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Crear Sesión
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nueva Sesión de Videollamada</DialogTitle>
              <DialogDescription>Programa una videollamada con un paciente</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="video-patient">Paciente</Label>
                <select
                  id="video-patient"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Seleccionar paciente...</option>
                  <option value="1">Juan Pérez</option>
                  <option value="2">María López</option>
                  <option value="3">Pedro Gómez</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="video-date">Fecha</Label>
                  <Input id="video-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video-time">Hora</Label>
                  <Input id="video-time" type="time" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="video-duration">Duración estimada</Label>
                <select
                  id="video-duration"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="45">45 minutos</option>
                  <option value="60">60 minutos</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>Crear Sesión</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {mockVideoSessions.map((session) => (
          <Card key={session.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {session.patient}
                    </CardTitle>
                    <Badge variant={statusConfig[session.status as keyof typeof statusConfig].variant}>
                      {statusConfig[session.status as keyof typeof statusConfig].label}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Sesión de videollamada
                  </CardDescription>
                </div>
                <Button>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Unirse
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{session.date}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>
                    {session.time} ({session.duration})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded">{session.roomId}</code>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyRoomId(session.roomId)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Unirse a una Sesión Existente</CardTitle>
          <CardDescription>Ingresa el ID de sala para unirte a una videollamada</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input placeholder="Ingresa el ID de sala (ej: vital-room-abc123)" className="flex-1" />
            <Button>
              <Video className="w-4 h-4 mr-2" />
              Unirse
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bloque funcional de unión con manejo de estado (videollamadas reales) */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Videollamada (conectar/crear)</CardTitle>
          <CardDescription>Usa el ID de sala o crea una nueva</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input placeholder="ID de sala (ej: abc123)" className="flex-1" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
            <Button onClick={handleJoin}>
              <Video className="w-4 h-4 mr-2" />
              Unirse
            </Button>
          </div>
          <div className="mt-3">
            <Button variant="outline" onClick={handleCreateRoom}>
              <Plus className="w-4 h-4 mr-2" />
              Crear sala
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
