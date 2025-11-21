"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, User, Stethoscope } from "lucide-react"

interface Message {
  id: string
  sender: "patient" | "doctor"
  senderName: string
  content: string
  timestamp: string
}

interface ChatSystemProps {
  userRole: "patient" | "doctor"
  userName: string
  conversationWith: string
}

const mockMessages: Message[] = [
  {
    id: "1",
    sender: "doctor",
    senderName: "Dr. María García",
    content: "Hola, ¿cómo te encuentras hoy?",
    timestamp: "10:30",
  },
  {
    id: "2",
    sender: "patient",
    senderName: "Juan Pérez",
    content: "Buenos días doctor, me siento mejor pero aún tengo algunas dudas sobre el tratamiento.",
    timestamp: "10:32",
  },
  {
    id: "3",
    sender: "doctor",
    senderName: "Dr. María García",
    content: "Claro, dime qué dudas tienes y con gusto te las aclaro.",
    timestamp: "10:33",
  },
]

export function ChatSystem({ userRole, userName, conversationWith }: ChatSystemProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      sender: userRole,
      senderName: userName,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Chat Médico</h2>
        <p className="text-muted-foreground">Conversación con {conversationWith}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{conversationWith}</CardTitle>
              <CardDescription>En línea</CardDescription>
            </div>
            <Badge variant="secondary">Activo</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => {
                const isCurrentUser = message.sender === userRole
                return (
                  <div key={message.id} className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}>
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.sender === "doctor" ? "bg-primary" : "bg-secondary"
                      }`}
                    >
                      {message.sender === "doctor" ? (
                        <Stethoscope className="w-4 h-4 text-primary-foreground" />
                      ) : (
                        <User className="w-4 h-4 text-secondary-foreground" />
                      )}
                    </div>
                    <div className={`flex-1 max-w-[70%] ${isCurrentUser ? "items-end" : "items-start"}`}>
                      <div
                        className={`rounded-lg p-3 ${
                          isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <p className="text-sm font-medium mb-1">{message.senderName}</p>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">{message.timestamp}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              placeholder="Escribe tu mensaje..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
