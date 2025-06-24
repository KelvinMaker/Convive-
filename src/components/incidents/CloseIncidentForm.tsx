// src/components/incidents/CloseIncidentForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { closeIncidentAction, getIncidentsAction } from "@/app/actions";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import type { Incident } from "@/lib/types";
import { Label } from "@/components/ui/label";

const closeIncidentSchema = z.object({
  incidentId: z.string().min(1, "Debes seleccionar un incidente."),
  closingObservation: z.string().min(10, "La observación debe tener al menos 10 caracteres.").max(1000),
});

type CloseIncidentFormValues = z.infer<typeof closeIncidentSchema>;

export default function CloseIncidentForm() {
  const { toast } = useToast();
  const { currentUser } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(true);
  const [selectedIncidentDescription, setSelectedIncidentDescription] = useState("");

  const form = useForm<CloseIncidentFormValues>({
    resolver: zodResolver(closeIncidentSchema),
    defaultValues: { incidentId: "", closingObservation: "" },
  });
  
  useEffect(() => {
    async function fetchIncidents() {
      setIsLoadingIncidents(true);
      const result = await getIncidentsAction();
      if (result.success && result.data) {
        // Show all incidents; closed incidents will be disabled in the dropdown.
        setIncidents(result.data);
      }
      setIsLoadingIncidents(false);
    }
    fetchIncidents();
  }, []);

  async function onSubmit(data: CloseIncidentFormValues) {
    if (!currentUser) {
        toast({ title: "Error", description: "Debes iniciar sesión para realizar esta acción.", variant: "destructive" });
        return;
    }
    if (currentUser.role !== 'directivo') {
        toast({ title: "Acceso Denegado", description: "No tienes permisos para cerrar incidentes.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("incidentId", data.incidentId);
    formData.append("closingObservation", data.closingObservation);
    formData.append("userId", currentUser.id);

    try {
      const result = await closeIncidentAction(formData);
      if (result.success) {
        toast({ title: "Incidente Cerrado", description: "El incidente ha sido cerrado y archivado." });
        router.push("/incidents/list");
      } else {
        toast({ title: "Error", description: result.error || "No se pudo cerrar el incidente.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error Inesperado", description: "Ocurrió un error en el servidor.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (currentUser?.role !== 'directivo') {
    return (
        <div className="text-destructive p-4 border border-destructive/50 rounded-md">
            <h3 className="font-bold">Acceso Denegado</h3>
            <p>Solo los usuarios con el rol 'Directivo' pueden cerrar incidentes.</p>
        </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="incidentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Incidente a Cerrar</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  const selected = incidents.find((inc) => inc.id === value);
                  setSelectedIncidentDescription(selected ? selected.description : "");
                  if (!value) {
                    setSelectedIncidentDescription("");
                  }
                }}
                defaultValue={field.value}
                disabled={isLoadingIncidents}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingIncidents ? "Cargando incidentes..." : "Selecciona un incidente..."} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {!isLoadingIncidents && incidents.length === 0 && <SelectItem value="none" disabled>No hay incidentes para seleccionar</SelectItem>}
                  {incidents.map((incident) => (
                    <SelectItem key={incident.id} value={incident.id} disabled={incident.status === 'closed'}>
                      {incident.title} {incident.status === 'closed' ? <span className="text-muted-foreground opacity-70 ml-2">(Cerrado)</span> : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Elige el incidente que deseas marcar como resuelto. Los incidentes ya cerrados están deshabilitados.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("incidentId") && selectedIncidentDescription && (
          <div className="space-y-2">
            <Label htmlFor="incident-description">Descripción del Incidente Registrado</Label>
            <Textarea
              id="incident-description"
              readOnly
              value={selectedIncidentDescription}
              className="resize-y min-h-[100px] bg-muted/50 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-default"
            />
            <FormDescription>
              Esta es la descripción original que se registró con el incidente.
            </FormDescription>
          </div>
        )}

        <FormField
          control={form.control}
          name="closingObservation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observación de Cierre</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe la resolución del incidente, las acciones tomadas y el resultado final..."
                  className="resize-y min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>Esta observación quedará registrada en el historial del incidente.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting || isLoadingIncidents}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Cerrar Incidente
        </Button>
      </form>
    </Form>
  );
}