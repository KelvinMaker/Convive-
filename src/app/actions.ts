
// src/app/actions.ts
"use server";

import type { Incident, IncidentType, User, UserRole, TriviaResult } from "@/lib/types";
import { summarizeIncidentReports } from "@/ai/flows/summarize-incident-reports";
import { z } from "zod";
import { SELF_REGISTER_USER_ROLES } from "@/lib/constants";
import { add } from "date-fns";
import { promises as fs } from 'fs';
import path from 'path';


// --- File System Data Persistence ---

const dataDir = path.join(process.cwd(), 'data');
const usersFilePath = path.join(dataDir, 'users.json');
const incidentsFilePath = path.join(dataDir, 'incidents.json');
const triviaResultsFilePath = path.join(dataDir, 'trivia_results.json');


async function ensureDataDirExists() {
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function readData<T>(filePath: string): Promise<T[]> {
  await ensureDataDirExists();
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent) as T[];
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []; // File doesn't exist yet, return empty array.
    }
    console.error(`Error reading data from ${filePath}:`, error);
    throw new Error(`Could not read data from ${filePath}`);
  }
}

async function writeData<T>(filePath: string, data: T[]): Promise<void> {
  await ensureDataDirExists();
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing data to ${filePath}:`, error);
    throw new Error(`Could not write data to ${filePath}`);
  }
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
  const users = await readData<User>(usersFilePath);
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
  const users = await readData<User>(usersFilePath);

  const newUser: User = {
    id: `user-${Date.now()}`,
    email,
    password, 
    role: 'directivo',
    name: email.split('@')[0], 
    status: 'active',
  };
  users.push(newUser);
  await writeData<User>(usersFilePath, users);
  
  console.log("Admin user created (file system):", newUser);
  return { success: true, user: newUser };
}

export async function loginUserAction(formData: FormData): Promise<{ success: boolean; error?: string; user?: User }> {
  const rawData = Object.fromEntries(formData.entries());
  const validation = LoginUserSchema.safeParse(rawData);

  if (!validation.success) {
    return { success: false, error: validation.error.flatten().fieldErrors.email?.[0] || validation.error.flatten().fieldErrors.password?.[0] || "Datos inválidos." };
  }
  
  const { email, password } = validation.data;
  const users = await readData<User>(usersFilePath);
  const user = users.find(u => u.email === email && u.status === 'active');

  if (!user) {
    return { success: false, error: "Usuario no encontrado o inactivo." };
  }

  if (user.password !== password) {
    return { success: false, error: "Contraseña incorrecta." };
  }
  
  console.log("User logged in (file system):", user);
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
  const users = await readData<User>(usersFilePath);

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return { success: false, error: "Ya existe un usuario con este correo electrónico." };
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    password, 
    role: role as UserRole, 
    status: 'active', 
  };
  users.push(newUser);
  await writeData<User>(usersFilePath, users);
  console.log("New user created (file system):", newUser);
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

const CloseIncidentSchema = z.object({
  incidentId: z.string().min(1, "Debe seleccionar un incidente."),
  closingObservation: z.string().min(10, "La observación debe tener al menos 10 caracteres."),
  userId: z.string(), // ID of the user closing the incident
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
    const creationDate = new Date();

    const newIncident: Incident = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      type: data.type as IncidentType,
      isAnonymous: data.isAnonymous,
      date: creationDate.toISOString(),
      expiresAt: add(creationDate, { days: 30 }).toISOString(),
      reportedBy: data.isAnonymous ? "anonimo" : data.userId || "desconocido",
      userId: data.isAnonymous ? undefined : data.userId,
      userName: data.isAnonymous ? "Anónimo" : data.userName,
      userRole: data.isAnonymous ? "anonimo" : data.userRole as UserRole,
      status: 'open',
    };

    const incidents = await readData<Incident>(incidentsFilePath);
    incidents.push(newIncident); 
    await writeData<Incident>(incidentsFilePath, incidents);
    console.log("Incident stored (file system):", newIncident.id);

    return { success: true, incidentId: newIncident.id };
  } catch (error) {
    console.error("Error submitting incident:", error);
    return { success: false, error: "Ocurrió un error en el servidor." };
  }
}

export async function closeIncidentAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validation = CloseIncidentSchema.safeParse(rawData);

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      const errorMessages = Object.values(fieldErrors).flat().join(". ");
      return { success: false, error: errorMessages || "Datos inválidos." };
    }

    const { incidentId, closingObservation, userId } = validation.data;
    const incidents = await readData<Incident>(incidentsFilePath);
    const incidentIndex = incidents.findIndex(inc => inc.id === incidentId);

    if (incidentIndex === -1) {
      return { success: false, error: "Incidente no encontrado." };
    }

    if (incidents[incidentIndex].status === 'closed') {
      return { success: false, error: "Este incidente ya ha sido cerrado." };
    }

    incidents[incidentIndex] = {
      ...incidents[incidentIndex],
      status: 'closed',
      closingObservation,
      closedAt: new Date().toISOString(),
      closedBy: userId,
    };

    await writeData<Incident>(incidentsFilePath, incidents);
    console.log("Incident closed (file system):", incidents[incidentIndex]);
    return { success: true };
  } catch (error) {
    console.error("Error closing incident:", error);
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
    const incidents = await readData<Incident>(incidentsFilePath);
    return { success: true, data: [...incidents].reverse() };
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return { success: false, error: "Failed to fetch incidents." };
  }
}

export async function deleteIncidentAction(incidentId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const users = await readData<User>(usersFilePath);
    const user = users.find(u => u.id === userId);

    if (!user || !['directivo', 'docente'].includes(user.role)) {
      return { success: false, error: "No tienes permiso para eliminar incidentes." };
    }

    let incidents = await readData<Incident>(incidentsFilePath);
    const initialLength = incidents.length;
    incidents = incidents.filter(incident => incident.id !== incidentId);
    
    if (incidents.length < initialLength) {
      await writeData<Incident>(incidentsFilePath, incidents);
      console.log("Incident deleted (file system):", incidentId);
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
    const users = await readData<User>(usersFilePath);
    return { success: true, data: [...users] };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users." };
  }
}

// --- Trivia Actions ---

const SaveTriviaResultSchema = z.object({
  score: z.coerce.number(),
  totalQuestions: z.coerce.number(),
  userId: z.string().optional(),
  userName: z.string().optional(),
});

export async function saveTriviaResultAction(formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validation = SaveTriviaResultSchema.safeParse(rawData);

    if (!validation.success) {
      return { success: false, error: "Datos de trivia inválidos." };
    }
    
    const data = validation.data;
    const newResult: TriviaResult = {
      id: `trivia-${Date.now()}`,
      userId: data.userId,
      userName: data.userName || 'Anónimo',
      score: data.score,
      totalQuestions: data.totalQuestions,
      playedAt: new Date().toISOString(),
    };

    const results = await readData<TriviaResult>(triviaResultsFilePath);
    results.push(newResult);
    await writeData<TriviaResult>(triviaResultsFilePath, results);
    
    console.log("Trivia result saved:", newResult.id);
    return { success: true };

  } catch (error) {
    console.error("Error saving trivia result:", error);
    return { success: false, error: "No se pudo guardar el resultado de la trivia." };
  }
}

export async function getTriviaStatsAction(): Promise<{ success: boolean; data?: { gamesPlayed: number; averageScore: number }; error?: string }> {
  try {
    const results = await readData<TriviaResult>(triviaResultsFilePath);
    const gamesPlayed = results.length;
    if (gamesPlayed === 0) {
      return { success: true, data: { gamesPlayed: 0, averageScore: 0 } };
    }
    const totalScore = results.reduce((acc, result) => acc + result.score, 0);
    const averageScore = totalScore / gamesPlayed;
    return { success: true, data: { gamesPlayed, averageScore } };
  } catch (error) {
    console.error("Error fetching trivia stats:", error);
    return { success: false, error: "No se pudieron obtener las estadísticas de la trivia." };
  }
}
