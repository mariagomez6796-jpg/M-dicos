"use client"

// Minimal client for videocalls-api
// Uses NEXT_PUBLIC_VIDEO_API_URL if provided; otherwise expects a Next.js rewrite at /video

export interface ConnectOptions {
  token: string
  code: string
  localStream?: MediaStream | null
  onRemoteStream?: (stream: MediaStream) => void
}

export interface Connection {
  ws: WebSocket
  pc: RTCPeerConnection
  close: () => void
}

function getHttpBase(): string {
  const envBase = process.env.NEXT_PUBLIC_VIDEO_API_URL
  if (envBase && envBase.length > 0) return envBase.replace(/\/$/, "")
  // Fallback to Next.js rewrite prefix
  return "/video"
}

function toWsBase(httpBase: string): string {
  // If base is relative (e.g. /video), construct full URL from location
  if (httpBase.startsWith("http://") || httpBase.startsWith("https://")) {
    return httpBase.replace(/^http/, "ws")
  }
  if (typeof window === "undefined") return httpBase // SSR guard (won't be used server-side)
  const origin = window.location.origin
  const full = `${origin}${httpBase}`
  return full.replace(/^http/, "ws")
}

export async function createRoom(token: string): Promise<{ code: string; title?: string }>
{
  const base = getHttpBase()
  const res = await fetch(`${base}/rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Error creando sala: ${res.status} ${res.statusText} ${text}`)
  }
  return res.json()
}

export async function getUserMedia(constraints: MediaStreamConstraints = { video: true, audio: true }) {
  return navigator.mediaDevices.getUserMedia(constraints)
}

export function stopStream(stream?: MediaStream | null) {
  if (!stream) return
  stream.getTracks().forEach((t) => t.stop())
}

export function connectToRoom(opts: ConnectOptions): Connection {
  const { token, code, localStream, onRemoteStream } = opts
  const httpBase = getHttpBase()
  const wsBase = toWsBase(httpBase)
  const wsUrl = `${wsBase}/ws/${encodeURIComponent(code)}?token=${encodeURIComponent(token)}`

  const ws = new WebSocket(wsUrl)
  const pc = new RTCPeerConnection()

  pc.onicecandidate = (ev) => {
    if (ev.candidate && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: "ice", candidate: ev.candidate }))
    }
  }
  pc.ontrack = (ev) => {
    if (onRemoteStream && ev.streams && ev.streams[0]) onRemoteStream(ev.streams[0])
  }
  if (localStream) {
    localStream.getTracks().forEach((t) => pc.addTrack(t, localStream))
  }

  ws.onmessage = async (ev) => {
    try {
      const msg = JSON.parse(ev.data)
      if (msg.type === "peer-join") {
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        ws.send(JSON.stringify({ type: "offer", sdp: pc.localDescription }))
      } else if (msg.type === "offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        ws.send(JSON.stringify({ type: "answer", sdp: pc.localDescription }))
      } else if (msg.type === "answer") {
        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
      } else if (msg.type === "ice") {
        try {
          await pc.addIceCandidate(msg.candidate)
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    }
  }

  const close = () => {
    try { ws.close() } catch {}
    try { pc.close() } catch {}
  }

  return { ws, pc, close }
}