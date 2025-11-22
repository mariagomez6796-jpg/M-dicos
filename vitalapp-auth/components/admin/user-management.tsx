"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, UserPlus, Mail, Phone, Calendar, MoreVertical, Trash2, Edit } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

// Mock data (doctors/admins kept as mock for now)
const mockDoctors = [
  {
    id: "1",
    name: "Dr. María García",
    email: "maria.garcia@vitalapp.com",
    phone: "+34 600 111 222",
    specialty: "Cardiología",
    patients: 45,
  },
  {
    id: "2",
    name: "Dr. Carlos Ruiz",
    email: "carlos.ruiz@vitalapp.com",
    phone: "+34 600 333 444",
    specialty: "Pediatría",
    patients: 62,
  },
  {
    id: "3",
    email: "ana.martinez@vitalapp.com",
    phone: "+34 600 555 666",
    specialty: "Dermatología",
    patients: 38,
  },
]

const mockAdmins = [
  { id: "1", name: "Admin Principal", email: "admin@vitalapp.com", phone: "+34 600 777 888", role: "Super Admin" },
  { id: "2", name: "Laura Sánchez", email: "laura.sanchez@vitalapp.com", phone: "+34 600 999 000", role: "Admin" },
]

// We'll fetch patients from the backend

const specialties = [
  "Cardiología",
  "Pediatría",
  "Dermatología",
  "Neurología",
  "Traumatología",
  "Ginecología",
  "Oftalmología",
  "Psiquiatría",
  "Medicina General",
]

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [userType, setUserType] = useState<"doctor" | "admin">("doctor")
  const [selectedSpecialty, setSelectedSpecialty] = useState("")
  const [addForm, setAddForm] = useState({ name: "", email: "", password: "", phoneNumber: "", specialty: "" })
  const [patients, setPatients] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>(mockDoctors)
  const [admins, setAdmins] = useState<any[]>(mockAdmins)
  const [isLoadingPatients, setIsLoadingPatients] = useState(false)
  const [patientsError, setPatientsError] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editUser, setEditUser] = useState<any | null>(null)
  const [editUserType, setEditUserType] = useState<"patient" | "doctor" | "admin">("patient")
  const [editForm, setEditForm] = useState({ name: "", emailAddress: "", phone: "", specialty: "" })
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchPatients = async () => {
    setIsLoadingPatients(true)
    setPatientsError(null)
    try {
      // Use relative path so Next dev server can proxy to backend and avoid CORS
      const res = await fetch(`${API_URL}/api/v1/patient`)
      if (!res.ok) throw new Error('Error al obtener pacientes')
      const data = await res.json()
      // Expecting an array, adjust if API returns { data: [...] }
      setPatients(Array.isArray(data) ? data : data.data ?? [])
    } catch (err: any) {
      console.error('Fetch patients error', err)
      setPatientsError(err?.message || 'Error al obtener pacientes')
      toast({ title: 'Error', description: err?.message || 'Error al obtener pacientes', variant: 'destructive' })
    } finally {
      setIsLoadingPatients(false)
    }
  }

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/doctor`)
      if (!res.ok) throw new Error('Error al obtener doctores')
      const data = await res.json()
      setDoctors(Array.isArray(data) ? data : data.data ?? [])
    } catch (err: any) {
      console.error('Fetch doctors error', err)
      toast({ title: 'Error', description: err?.message || 'Error al obtener doctores', variant: 'destructive' })
    }
  }

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/admin`)
      if (!res.ok) throw new Error('Error al obtener administradores')
      const data = await res.json()
      setAdmins(Array.isArray(data) ? data : data.data ?? [])
    } catch (err: any) {
      console.error('Fetch admins error', err)
      toast({ title: 'Error', description: err?.message || 'Error al obtener administradores', variant: 'destructive' })
    }
  }

  const handleAddSave = async () => {
    // only doctor/admin handled here (userType)
    const role = userType // 'doctor' | 'admin'
    if (!addForm.name || !addForm.email || !addForm.password) {
      toast({ title: 'Campos incompletos', description: 'Completa nombre, correo y contraseña', variant: 'destructive' })
      return
    }

    setIsAdding(true)
    try {
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const body: any = {
        name: addForm.name,
        email: addForm.email,
        password: addForm.password,
      }
      // include phoneNumber only for doctors
      if (role === 'doctor') {
        body.phoneNumber = addForm.phoneNumber
        body.phone = addForm.phoneNumber
        body.specialty = addForm.specialty
      }

      const res = await fetch(`${API_URL}/api/v1/${role}`, { method: 'POST', headers, body: JSON.stringify(body) })
      if (!res.ok) {
        const err = await res.text().catch(() => null)
        throw new Error(err || 'Error al crear usuario')
      }
      const updated = await res.json()

      // Refresh the appropriate list from server so UI reflects backend state
      if (role === 'doctor') {
        await fetchDoctors()
      } else if (role === 'admin') {
        await fetchAdmins()
      } else {
        await fetchPatients()
      }

      // reset form and close dialog
      setAddForm({ name: '', email: '', password: '', phoneNumber: '', specialty: '' })
      setIsAddDialogOpen(false)
      toast({ title: 'Creado', description: 'Usuario creado correctamente', variant: 'default' })
    } catch (err: any) {
      console.error('add user error', err)
      toast({ title: 'Error', description: err?.message || 'Error al crear usuario', variant: 'destructive' })
    } finally {
      setIsAdding(false)
    }
  }

  const handleDelete = async (id: string | number, type: "patient" | "doctor" | "admin" = "patient") => {
    if (!confirm(`¿Eliminar este ${type}? Esta acción no se puede deshacer.`)) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/v1/${type}/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined })
      if (!res.ok) throw new Error('No se pudo eliminar')
      if (type === 'patient') setPatients((prev) => prev.filter((p) => String(p.id) !== String(id)))
      if (type === 'doctor') {
        // refresh doctors from server after deletion
        await fetchDoctors()
      }
      if (type === 'admin') setAdmins((prev) => prev.filter((p) => String(p.id) !== String(id)))
  toast({ title: 'Eliminado', description: `${type} eliminado correctamente`, variant: 'default' })
    } catch (err) {
      console.error('delete user error', err)
      toast({ title: 'Error', description: 'Error al eliminar', variant: 'destructive' })
    }
  }

  const openEdit = (user: any, type: "patient" | "doctor" | "admin") => {
    setEditUser(user)
    setEditUserType(type)
    setEditForm({
      name: user.name ?? '',
      emailAddress: user.email ?? user.emailAddres ?? user.emailAddress ?? '',
      phone: type === 'doctor' ? (user.phoneNumber ?? user.phone ?? '') : (user.phone ?? ''),
      specialty: user.specialty ?? ''
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editUser) return
    setIsSavingEdit(true)
    try {
      const body: any = {
        name: editForm.name,
        email: editForm.emailAddress,
        emailAddres: editForm.emailAddress,
        emailAddress: editForm.emailAddress,
      }
      // include phoneNumber only when editing a doctor
      if (editUserType === 'doctor') {
        body.phone = editForm.phone
        body.phoneNumber = editForm.phone
        body.specialty = editForm.specialty
      } else {
        body.phone = editForm.phone
      }

      const token = localStorage.getItem('token')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      console.log("➡️ URL final:", `${API_URL}/api/v1/${editUserType}/${editUser.id}`);
      console.log("➡️ Token:", token);


      const res = await fetch(`${API_URL}/api/v1/${editUserType}/${editUser.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
        mode: 'cors',
        credentials: 'include',
      })
      if (!res.ok) {
        const err = await res.text().catch(() => null)
        throw new Error(err || 'Error al guardar cambios')
      }
      const updated = await res.json()

      // update the correct local list
      if (editUserType === 'patient') {
        setPatients((prev) => prev.map((p) => (String(p.id) === String(editUser.id) ? (updated || { ...p, ...body }) : p)))
      } else if (editUserType === 'doctor') {
        setDoctors((prev) => prev.map((p) => (String(p.id) === String(editUser.id) ? (updated || { ...p, ...body }) : p)))
      } else if (editUserType === 'admin') {
        setAdmins((prev) => prev.map((p) => (String(p.id) === String(editUser.id) ? (updated || { ...p, ...body }) : p)))
      }

      setIsEditDialogOpen(false)
      setEditUser(null)
  toast({ title: 'Guardado', description: 'Cambios guardados correctamente', variant: 'default' })
    } catch (err: any) {
      console.error('save edit error', err)
      const msg = err?.message || String(err) || 'Error al guardar cambios (network)'
      toast({ title: 'Error', description: msg, variant: 'destructive' })
    } finally {
      setIsSavingEdit(false)
    }
  }

  useEffect(() => {
    fetchPatients()
    fetchDoctors()
    fetchAdmins()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Agregar Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
              <DialogDescription>Completa los datos para crear un nuevo usuario en el sistema</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tipo de usuario</Label>
                <Tabs value={userType} onValueChange={(v) => setUserType(v as "doctor" | "admin")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="doctor">Doctor</TabsTrigger>
                    <TabsTrigger value="admin">Administrador</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-name">Nombre completo</Label>
                <Input id="new-name" placeholder="Dr. Juan Pérez" value={addForm.name} onChange={(e) => setAddForm((s) => ({ ...s, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-email">Correo electrónico</Label>
                <Input id="new-email" type="email" placeholder="juan.perez@vitalapp.com" value={addForm.email} onChange={(e) => setAddForm((s) => ({ ...s, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Contraseña</Label>
                <Input id="new-password" type="password" placeholder="••••••••" value={addForm.password} onChange={(e) => setAddForm((s) => ({ ...s, password: e.target.value }))} />
              </div>
              {userType === "doctor" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="new-phone">Teléfono</Label>
                    <Input id="new-phone" type="tel" placeholder="+34 600 000 000" value={addForm.phoneNumber} onChange={(e) => setAddForm((s) => ({ ...s, phoneNumber: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Especialidad</Label>
                    <Select value={addForm.specialty} onValueChange={(value) => setAddForm((s) => ({ ...s, specialty: value }))}>
                      <SelectTrigger id="specialty">
                        <SelectValue placeholder="Selecciona una especialidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties.map((specialty) => (
                              <SelectItem key={specialty} value={specialty}>
                                {specialty}
                              </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddSave} disabled={isAdding}>{isAdding ? 'Creando...' : 'Guardar'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="doctors" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="doctors">Doctores ({doctors.length})</TabsTrigger>
            <TabsTrigger value="admins">Administradores ({admins.length})</TabsTrigger>
            <TabsTrigger value="patients">Pacientes ({patients.length})</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchPatients}>
              Refrescar pacientes
            </Button>
          </div>
        </div>

        <TabsContent value="doctors" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <Card key={doctor.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{doctor.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {doctor.specialty}
                      </Badge>
                    </div>
                    <div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === String(doctor.id) ? null : String(doctor.id)) }}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      {openMenuId === String(doctor.id) && (
                        <div onClick={(e) => e.stopPropagation()} className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-20">
                          <button className="w-full text-left px-3 py-2 hover:bg-gray-100" onClick={() => { openEdit(doctor, 'doctor'); setOpenMenuId(null) }}>
                            <Edit className="inline w-4 h-4 mr-2" /> Ver / Editar
                          </button>
                          <button className="w-full text-left px-3 py-2 text-destructive hover:bg-gray-100" onClick={() => { setOpenMenuId(null); handleDelete(doctor.id, 'doctor') }}>
                            <Trash2 className="inline w-4 h-4 mr-2" /> Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{doctor.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{doctor.phoneNumber ?? doctor.phone ?? '-'}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{doctor.patients}</span> pacientes asignados
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {admins.map((admin) => (
              <Card key={admin.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{admin.name}</CardTitle>
                      <Badge variant="default" className="text-xs">
                        {admin.role}
                      </Badge>
                    </div>
                    <div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === String(admin.id) ? null : String(admin.id)) }}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      {openMenuId === String(admin.id) && (
                        <div onClick={(e) => e.stopPropagation()} className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-20">
                          <button className="w-full text-left px-3 py-2 hover:bg-gray-100" onClick={() => { openEdit(admin, 'admin'); setOpenMenuId(null) }}>
                            <Edit className="inline w-4 h-4 mr-2" /> Ver / Editar
                          </button>
                          <button className="w-full text-left px-3 py-2 text-destructive hover:bg-gray-100" onClick={() => { setOpenMenuId(null); handleDelete(admin.id, 'admin') }}>
                            <Trash2 className="inline w-4 h-4 mr-2" /> Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{admin.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{admin.phone ?? admin.phoneNumber ?? '-'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          {isLoadingPatients ? (
            <div className="p-6 text-center">Cargando pacientes...</div>
          ) : patientsError ? (
            <div className="p-6 text-center text-red-600">{patientsError}</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {patients.map((patient: any) => (
                <div key={patient.id} className="relative">
                  <div onClick={() => openEdit(patient, 'patient')} className="cursor-pointer">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{patient.name}</CardTitle>
                          <div className="relative">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === String(patient.id) ? null : String(patient.id)) }}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                            {openMenuId === String(patient.id) && (
                              <div onClick={(e) => e.stopPropagation()} className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-20">
                                <button className="w-full text-left px-3 py-2 hover:bg-gray-100" onClick={() => { openEdit(patient, 'patient'); setOpenMenuId(null) }}>
                                  <Edit className="inline w-4 h-4 mr-2" /> Ver / Editar
                                </button>
                                <button className="w-full text-left px-3 py-2 text-destructive hover:bg-gray-100" onClick={() => { setOpenMenuId(null); handleDelete(patient.id) }}>
                                  <Trash2 className="inline w-4 h-4 mr-2" /> Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                  
                  
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{patient.email ?? patient.emailAddres ?? patient.emailAddress ?? '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{patient.phone ?? '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Última visita: {patient.lastVisit}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{patient.appointments}</span> citas totales
                      </p>
                    </div>
                  </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      {/* Edit patient dialog */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsEditDialogOpen(false)} />
          <div className="bg-white rounded-lg p-6 z-10 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Editar paciente</h3>
            <div className="space-y-3">
              <div>
                <Label>Nombre</Label>
                <Input value={editForm.name} onChange={(e) => setEditForm((s) => ({ ...s, name: e.target.value }))} />
              </div>
              <div>
                <Label>Correo electrónico</Label>
                <Input value={editForm.emailAddress} onChange={(e) => setEditForm((s) => ({ ...s, emailAddress: e.target.value }))} />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input value={editForm.phone} onChange={(e) => setEditForm((s) => ({ ...s, phone: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveEdit} disabled={isSavingEdit}>{isSavingEdit ? 'Guardando...' : 'Guardar'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
