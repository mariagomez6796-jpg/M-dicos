"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Video, Calendar, Clock, User, ExternalLink, Copy } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
const mockVideoSessions = [
  {
    id: "1",
    doctor: "Dr. María García",
    specialty: "Cardiología",
    date: "2024-01-25",
    time: "15:00",
    duration: "30 min",
    roomId: "vital-room-abc123",
    status: "scheduled",
  },
  {
    id: "2",
    doctor: "Dr. Carlos Ruiz",
    specialty: "Pediatría",
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

export function PatientVideoCall() {

  const router = useRouter()
  const [joinCode, setJoinCode] = useState("")

  const copyRoomId = (roomId: string) => {
    navigator.clipboard.writeText(roomId)
    alert("ID de sala copiado al portapapeles")
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
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Videollamadas</h2>
        <p className="text-muted-foreground">Únete a tus consultas virtuales con los médicos</p>
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
                      {session.doctor}
                    </CardTitle>
                    <Badge variant={statusConfig[session.status as keyof typeof statusConfig].variant}>
                      {statusConfig[session.status as keyof typeof statusConfig].label}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    {session.specialty}
                  </CardDescription>
                </div>
                <Button>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Unirse a la Llamada
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
          <CardTitle className="text-lg">Unirse con ID de Sala</CardTitle>
          <CardDescription>Si tienes un ID de sala, ingrésalo aquí para unirte a la videollamada</CardDescription>
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

      {/* Bloque funcional para unirse por ID (videollamadas reales) */
      }
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Unirse usando ID</CardTitle>
          <CardDescription>Ingresa el ID de sala para unirte a la llamada</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input placeholder="ID de sala (ej: abc123)" className="flex-1" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
            <Button onClick={handleJoin}>
              <Video className="w-4 h-4 mr-2" />
              Unirse
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="bg-blue-600 rounded-full p-3 h-fit">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-900">Consejos para tu videollamada</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Asegúrate de tener una buena conexión a internet</li>
                <li>• Busca un lugar tranquilo y bien iluminado</li>
                <li>• Ten a mano tus documentos médicos relevantes</li>
                <li>• Únete 5 minutos antes de la hora programada</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}