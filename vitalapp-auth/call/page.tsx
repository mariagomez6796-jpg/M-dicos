"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authService } from "@/lib/auth"
import { connectToRoom, getUserMedia, stopStream, type Connection } from "@/lib/video"

export default function CallPage() {
  const params = useParams<{ code: string }>()
  const router = useRouter()
  const code = params?.code

  const localRef = useRef<HTMLVideoElement | null>(null)
  const remoteRef = useRef<HTMLVideoElement | null>(null)

  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [conn, setConn] = useState<Connection | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (localRef.current && localStream) {
      // @ts-ignore - srcObject exists on HTMLVideoElement at runtime
      localRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (remoteRef.current && remoteStream) {
      // @ts-ignore
      remoteRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  useEffect(() => {
    return () => {
      try { conn?.close() } catch {}
      stopStream(localStream)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startCamera = async () => {
    try {
      const stream = await getUserMedia()
      setLocalStream(stream)
    } catch (e) {
      setError("No se pudo acceder a la cámara/micrófono")
    }
  }

  const stopCamera = () => {
    stopStream(localStream)
    setLocalStream(null)
  }

  const join = async () => {
    try {
      const user = authService.getCurrentUser()
      if (!user?.token) {
        setError("Inicia sesión para unirte a la llamada")
        return
      }
      if (!code) {
        setError("Código de sala inválido")
        return
      }
      const c = connectToRoom({
        token: user.token,
        code: String(code),
        localStream: localStream || undefined,
        onRemoteStream: (s) => setRemoteStream(s),
      })
      setConn(c)
    } catch (e: any) {
      setError(e?.message || "Error al conectar a la sala")
    }
  }

  const leave = () => {
    try { conn?.close() } catch {}
    setConn(null)
    setRemoteStream(null)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Videollamada - Sala {String(code)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm mb-2">Mi cámara</p>
              <video ref={localRef} muted playsInline autoPlay className="w-full rounded-md bg-black" />
              <div className="flex gap-2 mt-2">
                <Button onClick={startCamera}>Iniciar cámara</Button>
                <Button variant="secondary" onClick={stopCamera}>Detener</Button>
              </div>
            </div>
            <div>
              <p className="text-sm mb-2">Remoto</p>
              <video ref={remoteRef} playsInline autoPlay className="w-full rounded-md bg-black" />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={join} disabled={!code}>Conectar</Button>
            <Button variant="secondary" onClick={leave}>Salir</Button>
            <Button variant="outline" onClick={() => router.back()}>Volver</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}