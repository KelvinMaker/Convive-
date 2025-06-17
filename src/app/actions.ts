// src/app/actions.ts
"use server";

import type { Incident, IncidentType, UserRole } from "@/lib/types";
import { summarizeIncidentReports } from "@/ai/flows/summarize-incident-reports";
import { z } from "zod";

// In-memory store for incidents (for demonstration purposes)
let incidents: Incident[] = [];

// Schema for incident submission from FormData
const SubmitIncidentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["conflicto", "logro"]),
  isAnonymous: z.string().transform(val => val === "true"), // FormData sends boolean as string
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
      id: Date.now().toString(), // Simple ID generation
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
    console.log("Incidents stored (in-memory):", incidents); // For debugging

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
    // The AI flow expects reports separated by newlines.
    // Here we assume `reports` string is already formatted that way or is a single report.
    const result = await summarizeIncidentReports({ reports });
    return { success: true, summary: result.summary };
  } catch (error) {
    console.error("Error generating summary with AI:", error);
    return { success: false, error: "Error al procesar con la IA." };
  }
}

// Action to get incidents (for future use, e.g., an incident list page)
export async function getIncidentsAction(): Promise<{ success: boolean; data?: Incident[]; error?: string }> {
  try {
    // In a real app, this would fetch from Firestore
    return { success: true, data: [...incidents].reverse() }; // Return a copy, newest first
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return { success: false, error: "Failed to fetch incidents." };
  }
}
