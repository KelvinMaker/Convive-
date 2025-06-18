
// src/app/actions.ts
"use server";

import type { Incident, IncidentType, User, UserRole } from "@/lib/types";
import { summarizeIncidentReports } from "@/ai/flows/summarize-incident-reports";
import { z } from "zod";
import { SELF_REGISTER_USER_ROLES } from "@/lib/constants";


declare global {
  // eslint-disable-next-line no-var
  var __users_store__: User[] | undefined;
  // eslint-disable-next-line no-var
  var __incidents_store__: Incident[] | undefined;
}

let users: User[];
let incidents: Incident[];

if (process.env.NODE_ENV === 'production') {
  users = [];
  incidents = [];
} else {
  if (!global.__users_store__) {
    global.__users_store__ = [];
  }
  if (!global.__incidents_store__) {
    global.__incidents_store__ = [];
  }
  users = global.__users_store__;
  incidents = global.__incidents_store__;
}


// --- User Management Schemas ---
const CreateInitialAdminSchema = z.object({
  email: z.string().email("Email inválido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

const LoginUserSchema = z.object({
  email: z.string().email("Email inválido."),
  password: z.string().min(1, "Contraseña requerida."),
});

const CreateUserSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  email: z.string().email("Debe ser un email válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  confirmPassword: z.string(),
  role: z.enum(SELF_REGISTER_USER_ROLES.map(role => role.value) as [UserRole, ...UserRole[]]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});


// --- User Management Actions ---
export async function checkAdminExistsAction(): Promise<boolean> {
  return users.some(user => user.role === 'directivo' && user.status === 'active');
}

export async function createInitialAdminAction(formData: FormData): Promise<{ success: boolean; error?: string; user?: User }> {
  const adminExists = await checkAdminExistsAction();
  if (adminExists) {
    return { success: false, error: "Ya existe un administrador." };
  }

  const rawData = Object.fromEntries(formData.entries());
  const validation = CreateInitialAdminSchema.safeParse(rawData);

  if (!validation.success) {
    return { success: false, error: validation.error.flatten().fieldErrors.email?.[0] || validation.error.flatten().fieldErrors.password?.[0] || validation.error.flatten().fieldErrors.confirmPassword?.[0] || "Datos inválidos." };
  }

  const { email, password } = validation.data;

  const newUser: User = {
    id: `user-${Date.now()}`,
    email,
    password, // Storing plain text for prototype ONLY. HASH IN PRODUCTION!
    role: 'directivo',
    name: email.split('@')[0], // Use part of email as name for now
    status: 'active',
  };
  users.push(newUser);
  console.log("Admin user created (in-memory):", newUser);
  console.log("All users:", users);
  return { success: true, user: newUser };
}

export async function loginUserAction(formData: FormData): Promise<{ success: boolean; error?: string; user?: User }> {
  const rawData = Object.fromEntries(formData.entries());
  const validation = LoginUserSchema.safeParse(rawData);

  if (!validation.success) {
    return { success: false, error: validation.error.flatten().fieldErrors.email?.[0] || validation.error.flatten().fieldErrors.password?.[0] || "Datos inválidos." };
  }
  
  const { email, password } = validation.data;
  const user = users.find(u => u.email === email && u.status === 'active');

  if (!user) {
    return { success: false, error: "Usuario no encontrado o inactivo." };
  }

  if (user.password !== password) {
    return { success: false, error: "Contraseña incorrecta." };
  }
  
  console.log("User logged in (in-memory):", user);
  return { success: true, user };
}

export async function createUserAction(formData: FormData): Promise<{ success: boolean; error?: string; user?: User }> {
  const rawData = Object.fromEntries(formData.entries());
  const validation = CreateUserSchema.safeParse(rawData);

  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    const errorMessages = Object.values(fieldErrors).flat().join(". ");
    return { success: false, error: errorMessages || "Datos de registro inválidos." };
  }

  const { name, email, password, role } = validation.data;

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return { success: false, error: "Ya existe un usuario con este correo electrónico." };
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    password, // Storing plain text for prototype ONLY. HASH IN PRODUCTION!
    role: role as UserRole, // Role is validated by schema
    status: 'active', // New users are active by default
  };
  users.push(newUser);
  console.log("New user created (in-memory):", newUser);
  console.log("All users:", users);
  return { success: true, user: newUser };
}


// --- Incident Management Schemas & Actions ---
const SubmitIncidentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["conflicto", "logro"]),
  isAnonymous: z.string().transform(val => val === "true"),
  userId: z.string().optional(),
  userName: z.string().optional(),
  userRole: z.string().optional(),
});

export async function submitIncidentAction(formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validation = SubmitIncidentSchema.safeParse(rawData);

    if (!validation.success) {
      console.error("Validation errors:", validation.error.flatten().fieldErrors);
      return { success: false, error: "Datos inválidos: " + Object.values(validation.error.flatten().fieldErrors).flat().join(', ') };
    }
    
    const data = validation.data;

    const newIncident: Incident = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      type: data.type as IncidentType,
      isAnonymous: data.isAnonymous,
      date: new Date().toISOString(),
      reportedBy: data.isAnonymous ? "anonimo" : data.userId || "desconocido",
      userId: data.isAnonymous ? undefined : data.userId,
      userName: data.isAnonymous ? "Anónimo" : data.userName,
      userRole: data.isAnonymous ? "anonimo" : data.userRole as UserRole,
    };

    incidents.push(newIncident); 
    console.log("Incidents stored (in-memory):", incidents);

    return { success: true, incidentId: newIncident.id };
  } catch (error) {
    console.error("Error submitting incident:", error);
    return { success: false, error: "Ocurrió un error en el servidor." };
  }
}

export async function generateSummaryAction(reports: string) {
  if (!reports.trim()) {
    return { success: false, error: "No hay reportes para resumir." };
  }
  try {
    const result = await summarizeIncidentReports({ reports });
    return { success: true, summary: result.summary };
  } catch (error) {
    console.error("Error generating summary with AI:", error);
    return { success: false, error: "Error al procesar con la IA." };
  }
}

export async function getIncidentsAction(): Promise<{ success: boolean; data?: Incident[]; error?: string }> {
  try {
    return { success: true, data: [...incidents].reverse() };
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return { success: false, error: "Failed to fetch incidents." };
  }
}

export async function deleteIncidentAction(incidentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const initialLength = incidents.length;
    incidents = incidents.filter(incident => incident.id !== incidentId);
    if (incidents.length < initialLength) {
      console.log("Incident deleted (in-memory):", incidentId);
      console.log("Remaining incidents:", incidents);
      return { success: true };
    } else {
      return { success: false, error: "Incidente no encontrado." };
    }
  } catch (error) {
    console.error("Error deleting incident:", error);
    return { success: false, error: "Error al eliminar el incidente." };
  }
}


export async function getUsersAction(): Promise<{ success: boolean; data?: User[]; error?: string }> {
  try {
    return { success: true, data: [...users] };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users." };
  }
}

