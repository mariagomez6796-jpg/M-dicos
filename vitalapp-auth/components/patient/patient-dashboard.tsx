"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, FileText, Pill, Video, MessageCircle } from "lucide-react"
import { AppointmentBooking } from "./appointment-booking"
import { MyAppointments } from "./my-appointments"
import { PrescriptionsView } from "./prescriptions-view"
import { PatientVideoCall } from "./patient-video-call"
import { ChatSystem } from "../shared/chat-system"

export function PatientDashboard() {
  const [activeTab, setActiveTab] = useState("book")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Mi Panel de Salud</h1>
        <p className="text-muted-foreground">Gestiona tus citas médicas y consulta tu información de salud</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="book" className="gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Agendar</span>
          </TabsTrigger>
          <TabsTrigger value="appointments" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Mis Citas</span>
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="gap-2">
            <Pill className="w-4 h-4" />
            <span className="hidden sm:inline">Recetas</span>
          </TabsTrigger>
          <TabsTrigger value="video" className="gap-2">
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">Videollamadas</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="book" className="space-y-4">
          <AppointmentBooking />
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <MyAppointments />
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-4">
          <PrescriptionsView />
        </TabsContent>

        <TabsContent value="video" className="space-y-4">
          <PatientVideoCall />
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <ChatSystem userRole="patient" userName="Juan Pérez" conversationWith="Dr. María García" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
