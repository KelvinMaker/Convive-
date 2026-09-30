"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { getIncidentsAction, deleteIncidentAction } from "@/app/actions";
import type { Incident } from "@/lib/types";
import { Loader2, AlertTriangle, Plus, Search, CalendarDays, Trash2 } from "lucide-react";
import { format, isValid } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { Eyebrow, PageBody, PageLead, PageTitle, yellowBtn } from "@/components/convive/ui";

type Filter = "todos" | "open" | "closed";

export default function IncidentListPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("todos");
  const [visibleCount, setVisibleCount] = useState(3);
  const [openId, setOpenId] = useState<string | null>(null);
  const { playerName } = useUser();
  const { toast } = useToast();

  const fetchIncidents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getIncidentsAction();
      if (result.success && result.data) setIncidents(result.data);
      else {
        setError(result.error || "No se pudieron cargar los incidentes.");
        setIncidents([]);
      }
    } catch (err) {
      console.error("Error fetching incidents:", err);
      setError("Error al conectar con el servidor para obtener incidentes.");
      setIncidents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleDeleteIncident = async (incidentId: string) => {
    if (!playerName) {
      toast({ title: "Error", description: "Escribe tu nombre para eliminar un incidente.", variant: "destructive" });
      return;
    }
    const result = await deleteIncidentAction(incidentId);
    if (result.success) {
      toast({ title: "Incidente eliminado", description: "El incidente se eliminó correctamente." });
      fetchIncidents();
    } else {
      toast({ title: "Error al eliminar", description: result.error || "No se pudo eliminar el incidente.", variant: "destructive" });
    }
  };

  const counts = useMemo(
    () => ({
      todos: incidents.length,
      open: incidents.filter((item) => item.status !== "closed").length,
      closed: incidents.filter((item) => item.status === "closed").length,
    }),
    [incidents]
  );

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return incidents.filter((incident) => {
      if (filter !== "todos" && incident.status !== filter) return false;
      if (!text) return true;
      return [incident.title, incident.description, incident.userName, incident.id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(text));
    });
  }, [incidents, filter, query]);

  const visible = filtered.slice(0, visibleCount);

  const filters: { id: Filter; label: string; className: string }[] = [
    { id: "todos", label: `Todos · ${counts.todos}`, className: "bg-[#e4f8fd] text-[#082a5e]" },
    { id: "open", label: `Abiertos · ${counts.open}`, className: "bg-[#fdeaf2] text-[#e64a86]" },
    { id: "closed", label: `Cerrados · ${counts.closed}`, className: "bg-[#e8f8f0] text-[#18a96b]" },
  ];

  return (
    <PageBody>
      <div className="flex flex-col gap-2">
        <Eyebrow>Convivencia escolar</Eyebrow>
        <PageTitle>Incidentes registrados</PageTitle>
        <PageLead>Revisa el estado, da seguimiento y cierra los casos resueltos.</PageLead>
      </div>

      <Link href="/incidents/new" className={yellowBtn}>
        <Plus className="size-[18px]" />
        Registrar nuevo incidente
      </Link>

      <label className="flex h-[50px] items-center gap-3 rounded-xl border border-[#dce7f2] bg-white px-4">
        <Search className="size-[18px] text-[#5f7088]" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setVisibleCount(3);
          }}
          placeholder="Buscar por título o persona..."
          className="h-full w-full bg-transparent text-sm text-[#10233f] outline-none placeholder:text-[#5f7088]"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setFilter(item.id);
              setVisibleCount(3);
            }}
            className={`rounded-full px-2.5 py-1.5 text-xs font-bold ${item.className} ${filter === item.id ? "ring-2 ring-[#082a5e]" : ""}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-[#5f7088]">
          <Loader2 className="size-5 animate-spin text-[#082a5e]" />
          Cargando incidentes...
        </div>
      ) : error ? (
        <div className="py-10 text-center text-[#e64a86]">
          <AlertTriangle className="mx-auto mb-2 size-10" />
          <p>{error}</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="py-8 text-center text-sm text-[#5f7088]">No hay incidentes para este filtro.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((incident) => {
            const incidentDate = new Date(incident.date);
            const closed = incident.status === "closed";
            const expanded = openId === incident.id;
            const code = `INC-${isValid(incidentDate) ? format(incidentDate, "yyyy") : "0000"}-${incident.id.slice(0, 4).toUpperCase()}`;
            return (
              <article key={incident.id} className="flex flex-col gap-4 rounded-3xl border border-[#dce7f2] bg-white p-5 shadow-[0_8px_22px_rgba(8,42,94,0.08)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-extrabold text-[#082a5e]">{code}</p>
                    <span className={`w-fit rounded-full px-2.5 py-1.5 text-xs font-bold ${closed ? "bg-[#e8f8f0] text-[#18a96b]" : "bg-[#fdeaf2] text-[#e64a86]"}`}>
                      {closed ? "Cerrado" : "Abierto"}
                    </span>
                  </div>
                  <span className={`rounded-full px-2.5 py-1.5 text-xs font-bold ${incident.type === "logro" ? "bg-[#e4f8fd] text-[#082a5e]" : "bg-[#fff0e4] text-[#f58a3a]"}`}>
                    {incident.type === "logro" ? "Logro" : "Conflicto"}
                  </span>
                </div>
                <p className="inline-flex items-center gap-1.5 text-xs text-[#5f7088]">
                  <CalendarDays className="size-3.5" />
                  {isValid(incidentDate) ? format(incidentDate, "d MMM · HH:mm", { locale: es }) : "Sin fecha"}
                </p>
                <p className="text-sm font-semibold leading-snug text-[#10233f]">{incident.title}</p>
                <p className="text-xs text-[#5f7088]">
                  Reportado por: {incident.userName || (incident.isAnonymous ? "Anónimo" : "Desconocido")}
                </p>
                {expanded ? (
                  <div className="rounded-xl bg-[#f4f8fc] p-3 text-sm leading-relaxed text-[#10233f]">
                    {incident.description}
                    {incident.closingObservation ? (
                      <p className="mt-2 text-xs text-[#5f7088]">Cierre: {incident.closingObservation}</p>
                    ) : null}
                  </div>
                ) : null}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setOpenId(expanded ? null : incident.id)}
                    className="inline-flex h-[42px] flex-1 items-center justify-center rounded-xl bg-[#eaf2ff] text-xs font-bold text-[#082a5e]"
                  >
                    {expanded ? "Ocultar detalle" : "Ver detalle"}
                  </button>
                  {closed ? (
                    <span className="inline-flex h-[42px] flex-1 items-center justify-center rounded-xl bg-[#e8f8f0] text-xs font-bold text-[#18a96b]">
                      Ver cierre
                    </span>
                  ) : (
                    <Link
                      href={`/incidents/close?id=${incident.id}`}
                      className="inline-flex h-[42px] flex-1 items-center justify-center rounded-xl bg-[#082a5e] text-xs font-bold text-white"
                    >
                      Cerrar incidente
                    </Link>
                  )}
                </div>
                {expanded && playerName ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteIncident(incident.id)}
                    className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-[#e64a86]"
                  >
                    <Trash2 className="size-3.5" />
                    Eliminar incidente
                  </button>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      {filtered.length > 0 ? (
        <p className="text-center text-xs font-semibold text-[#5f7088]">
          Mostrando {visible.length} de {filtered.length} incidentes
          {visible.length < filtered.length ? (
            <>
              {" · "}
              <button type="button" className="underline" onClick={() => setVisibleCount((count) => count + 3)}>
                Ver más
              </button>
            </>
          ) : null}
        </p>
      ) : null}
    </PageBody>
  );
}
