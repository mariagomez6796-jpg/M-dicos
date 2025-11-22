"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, FileText, History, Video, MessageCircle } from "lucide-react"
import { PendingAppointments } from "./pending-appointments"
import { TreatmentManagement } from "./treatment-management"
import { MedicalHistoryEditor } from "./medical-history-editor"
import { VideoCallManager } from "./video-call-manager"
import { ChatSystem } from "../shared/chat-system"

export function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState("appointments")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Panel del Doctor</h1>
        <p className="text-muted-foreground">Gestiona tus citas, tratamientos y consultas médicas</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="appointments" className="gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Citas</span>
          </TabsTrigger>
          <TabsTrigger value="treatments" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Tratamientos</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Historial</span>
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

        <TabsContent value="appointments" className="space-y-4">
          <PendingAppointments />
        </TabsContent>

        <TabsContent value="treatments" className="space-y-4">
          <TreatmentManagement />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <MedicalHistoryEditor />
        </TabsContent>

        <TabsContent value="video" className="space-y-4">
          <VideoCallManager />
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <ChatSystem userRole="doctor" userName="Dr. María García" conversationWith="Juan Pérez" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
