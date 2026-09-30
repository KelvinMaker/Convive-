"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { closeIncidentAction, getIncidentsAction } from "@/app/actions";
import { useUser } from "@/contexts/UserContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import Link from "next/link";
import type { Incident } from "@/lib/types";
import { format, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { areaClass, fieldClass, navyBtn, outlineBtn } from "@/components/convive/ui";

const closeIncidentSchema = z.object({
  incidentId: z.string().min(1, "Debes seleccionar un incidente."),
  closingObservation: z.string().min(10, "La observación debe tener al menos 10 caracteres.").max(1000),
});

type CloseIncidentFormValues = z.infer<typeof closeIncidentSchema>;

export default function CloseIncidentForm() {
  const { toast } = useToast();
  const { playerName } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetId = searchParams.get("id") ?? "";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openIncidents, setOpenIncidents] = useState<Incident[]>([]);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  const form = useForm<CloseIncidentFormValues>({
    resolver: zodResolver(closeIncidentSchema),
    defaultValues: { incidentId: presetId, closingObservation: "" },
  });

  useEffect(() => {
    async function fetchIncidents() {
      setIsLoadingIncidents(true);
      const result = await getIncidentsAction();
      if (result.success && result.data) {
        const open = result.data.filter((incident) => incident.status !== "closed");
        setOpenIncidents(open);
        if (presetId && open.some((incident) => incident.id === presetId)) {
          form.setValue("incidentId", presetId);
        }
      }
      setIsLoadingIncidents(false);
    }
    fetchIncidents();
  }, [form, presetId]);

  const selected = openIncidents.find((incident) => incident.id === form.watch("incidentId"));

  async function onSubmit(data: CloseIncidentFormValues) {
    if (!playerName) {
      toast({ title: "Error", description: "Escribe tu nombre para realizar esta acción.", variant: "destructive" });
      return;
    }
    if (!confirmed) {
      toast({ title: "Confirmación pendiente", description: "Confirma que se realizó el seguimiento.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("incidentId", data.incidentId);
    formData.append("closingObservation", data.closingObservation);
    formData.append("userId", playerName);

    try {
      const result = await closeIncidentAction(formData);
      if (result.success) {
        toast({ title: "Incidente cerrado", description: "El incidente quedó archivado." });
        router.push("/incidents/list");
      } else {
        toast({ title: "Error", description: result.error || "No se pudo cerrar el incidente.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error inesperado", description: "Ocurrió un error en el servidor.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedDate = selected ? new Date(selected.date) : null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {selected ? (
          <div className="flex flex-col gap-4 rounded-3xl border border-[#dce7f2] bg-white p-4 shadow-[0_8px_22px_rgba(8,42,94,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-extrabold text-[#082a5e]">Resumen del incidente</p>
              <span className="rounded-full bg-[#fff0e4] px-2.5 py-1.5 text-xs font-bold text-[#f58a3a]">
                {selected.type === "logro" ? "Logro" : "Conflicto"}
              </span>
            </div>
            <p className="text-sm font-semibold leading-snug text-[#10233f]">{selected.title}</p>
            <div className="text-xs leading-relaxed text-[#5f7088]">
              <p>
                {selectedDate && isValid(selectedDate) ? format(selectedDate, "d MMM yyyy · HH:mm", { locale: es }) : "Sin fecha"}
              </p>
              <p className="mt-1.5">{selected.userName || (selected.isAnonymous ? "Anónimo" : "Sin reportante")}</p>
            </div>
          </div>
        ) : null}

        <FormField
          control={form.control}
          name="incidentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-[#10233f]">
                Incidente <span className="text-[#e64a86]">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingIncidents}>
                <FormControl>
                  <SelectTrigger className={fieldClass}>
                    <SelectValue placeholder={isLoadingIncidents ? "Cargando incidentes..." : "Selecciona un incidente"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {openIncidents.map((incident) => (
                    <SelectItem key={incident.id} value={incident.id}>
                      {incident.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="closingObservation"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-[#10233f]">
                Observación de cierre <span className="text-[#e64a86]">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe la resolución, las acciones tomadas y el resultado."
                  className={areaClass}
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-[#5f7088]">Esta observación quedará en el historial del incidente.</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <button
          type="button"
          onClick={() => setConfirmed((value) => !value)}
          className="flex items-start gap-3 rounded-2xl bg-[#e8f8f0] p-4 text-left"
        >
          <span className={`flex size-6 shrink-0 items-center justify-center rounded-md ${confirmed ? "bg-[#18a96b] text-white" : "border border-[#dce7f2] bg-white"}`}>
            {confirmed ? "✓" : ""}
          </span>
          <span className="text-xs leading-relaxed text-[#10233f]">
            Confirmo que se realizó el seguimiento y no quedan acciones pendientes.
          </span>
        </button>

        <div className="flex items-start gap-3 rounded-2xl bg-[#fff7d1] p-4">
          <TriangleAlert className="size-5 shrink-0 text-[#e6a900]" />
          <p className="text-xs leading-relaxed text-[#10233f]">
            Al cerrar el incidente, el estado cambiará a Cerrado. El registro seguirá disponible para consulta.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button type="submit" disabled={isSubmitting || isLoadingIncidents} className={navyBtn}>
            {isSubmitting ? <Loader2 className="size-[18px] animate-spin" /> : <CheckCircle2 className="size-[18px]" />}
            Confirmar cierre
          </button>
          <Link href="/incidents/list" className={outlineBtn}>
            Cancelar
          </Link>
        </div>
      </form>
    </Form>
  );
}
