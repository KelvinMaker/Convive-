"use client";

import { useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Lightbulb,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { Eyebrow, PageBody, PageLead, PageTitle, navyBtn, outlineBtn, yellowBtn } from "@/components/convive/ui";

interface ParsedRow {
  name: string;
  score: number;
  total: number;
  date: Date | null;
}

function parseCsv(text: string): ParsedRow[] {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase();
  const isDesignFormat = header.includes("fecha") && header.includes("puntaje") && !header.includes("total");

  return lines.slice(1).flatMap((line) => {
    const parts = line.split(",").map((part) => part.trim().replace(/^"|"$/g, ""));
    if (isDesignFormat) {
      if (parts.length < 3) return [];
      const date = parse(parts[0], "dd/MM/yyyy", new Date());
      const score = parseInt(parts[2], 10);
      if (Number.isNaN(score)) return [];
      return [{ name: parts[1] || "JUGADOR 1", score, total: 10, date: Number.isNaN(date.getTime()) ? null : date }];
    }
    if (parts.length < 4) return [];
    const score = parseInt(parts[1], 10);
    const total = parseInt(parts[2], 10) || 10;
    const date = parse(parts[3], "dd/MM/yyyy HH:mm:ss", new Date());
    if (Number.isNaN(score)) return [];
    return [{
      name: parts[0] || "JUGADOR 1",
      score,
      total,
      date: Number.isNaN(date.getTime()) ? null : date,
    }];
  });
}

export default function AISummaryView() {
  const [reportsText, setReportsText] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const summary = useMemo(() => {
    if (rows.length === 0) return null;
    const totalQuestions = rows.reduce((sum, row) => sum + row.total, 0);
    const correct = rows.reduce((sum, row) => sum + row.score, 0);
    const percent = totalQuestions ? Math.round((correct / totalQuestions) * 100) : 0;
    const average = rows.reduce((sum, row) => sum + (row.total ? (row.score / row.total) * 10 : row.score), 0) / rows.length;
    const best = rows.reduce((max, row) => (row.score > max.score ? row : max), rows[0]);
    const dates = rows.map((row) => row.date).filter((date): date is Date => Boolean(date)).sort((a, b) => a.getTime() - b.getTime());
    const weekday = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const byDay = weekday.map((label) => ({ label, count: 0 }));
    rows.forEach((row) => {
      if (!row.date) return;
      byDay[row.date.getDay()].count += row.total || row.score;
    });
    const maxDay = Math.max(1, ...byDay.map((day) => day.count));
    const peak = byDay.reduce((top, day) => (day.count > top.count ? day : top), byDay[0]);
    return {
      games: rows.length,
      percent,
      correct,
      missed: Math.max(0, totalQuestions - correct),
      average,
      bestLabel: `${best.score}/${best.total}`,
      from: dates[0],
      to: dates[dates.length - 1],
      byDay,
      maxDay,
      peak: peak.label,
    };
  }, [rows]);

  const handleGenerate = () => {
    if (!reportsText.trim()) {
      toast({ title: "Entrada vacía", description: "Pega el contenido CSV para generar el análisis.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    window.setTimeout(() => {
      const parsed = parseCsv(reportsText);
      if (parsed.length === 0) {
        toast({
          title: "No se pudo leer el CSV",
          description: "Incluye la fila de encabezados y al menos una partida.",
          variant: "destructive",
        });
        setRows([]);
      } else {
        setRows(parsed);
        toast({ title: "Análisis generado", description: `Se analizaron ${parsed.length} partidas.` });
      }
      setIsLoading(false);
    }, 400);
  };

  const downloadSummary = () => {
    if (!summary) return;
    const lines = [
      "Resumen Convive+",
      `Partidas,${summary.games}`,
      `Aciertos,${summary.percent}%`,
      `Promedio,${summary.average.toFixed(1)}`,
      `Mejor puntaje,${summary.bestLabel}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = "resumen_trivia.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (summary) {
    const range =
      summary.from && summary.to
        ? `Analizamos ${summary.games} partidas registradas entre el ${format(summary.from, "d", { locale: es })} y el ${format(summary.to, "d 'de' MMMM", { locale: es })}.`
        : `Analizamos ${summary.games} partidas.`;
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - summary.percent / 100);

    return (
      <PageBody>
        <div className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#e8f8f0] px-2.5 py-1.5 text-xs font-bold text-[#18a96b]">
            <CheckCircle2 className="size-3.5" />
            Análisis generado
          </span>
          <div className="flex flex-col gap-2">
            <PageTitle>Tu actividad, en claro</PageTitle>
            <PageLead>{range}</PageLead>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-3xl border border-[#dce7f2] bg-white p-5 shadow-[0_8px_22px_rgba(8,42,94,0.08)]">
          <p className="text-lg font-extrabold text-[#061b3d]">Rendimiento general</p>
          <div className="flex items-center gap-5">
            <div className="relative size-[146px] shrink-0">
              <svg viewBox="0 0 146 146" className="size-full -rotate-90" aria-hidden>
                <circle cx="73" cy="73" r={radius} fill="none" stroke="#dce7f2" strokeWidth="12" />
                <circle
                  cx="73"
                  cy="73"
                  r={radius}
                  fill="none"
                  stroke="#06bfea"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[34px] font-extrabold leading-none text-[#061b3d]">{summary.percent}%</p>
                <p className="mt-1 text-[11px] font-bold text-[#5f7088]">aciertos</p>
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-3">
              <p className="flex items-center gap-2 text-xs text-[#10233f]">
                <span className="size-2.5 rounded-full bg-[#06bfea]" />
                {summary.correct} respuestas correctas
              </p>
              <p className="flex items-center gap-2 text-xs text-[#10233f]">
                <span className="size-2.5 rounded-full bg-[#dce7f2]" />
                {summary.missed} por reforzar
              </p>
              <span className="inline-flex w-fit items-center gap-1 rounded-full bg-[#e8f8f0] px-2.5 py-1.5 text-xs font-bold text-[#18a96b]">
                <TrendingUp className="size-3.5" />
                Pico: {summary.peak}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2.5 rounded-2xl border border-[#dce7f2] bg-white p-4">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#fff7d1]">
              <Target className="size-[18px] text-[#e6a900]" />
            </span>
            <p className="text-2xl font-extrabold text-[#061b3d]">{summary.average.toFixed(1).replace(".", ",")}</p>
            <p className="text-xs font-medium text-[#5f7088]">Promedio</p>
          </div>
          <div className="flex flex-col gap-2.5 rounded-2xl border border-[#dce7f2] bg-white p-4">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#e8f8f0]">
              <Trophy className="size-[18px] text-[#18a96b]" />
            </span>
            <p className="text-2xl font-extrabold text-[#061b3d]">{summary.bestLabel}</p>
            <p className="text-xs font-medium text-[#5f7088]">Mejor puntaje</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-3xl border border-[#dce7f2] bg-white p-5 shadow-[0_8px_22px_rgba(8,42,94,0.08)]">
          <div>
            <p className="text-lg font-extrabold text-[#061b3d]">Actividad diaria</p>
            <p className="mt-1 text-xs text-[#5f7088]">Preguntas respondidas por día</p>
          </div>
          <div className="flex h-[150px] items-end gap-2.5">
            {summary.byDay.map((day) => {
              const height = day.count === 0 ? 8 : Math.max(16, (day.count / summary.maxDay) * 116);
              const peak = day.label === summary.peak && day.count > 0;
              return (
                <div key={day.label} className="flex h-[142px] min-w-0 flex-1 flex-col items-center gap-1.5">
                  <div className="flex h-[116px] w-full flex-col justify-end">
                    <div className={`w-full rounded-t-md ${peak ? "bg-[#ffd43b]" : "bg-[#06bfea]"}`} style={{ height }} />
                  </div>
                  <span className="text-[11px] font-semibold text-[#5f7088]">{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl bg-[#fff7d1] p-4">
          <Lightbulb className="size-[23px] shrink-0 text-[#e6a900]" />
          <div>
            <p className="text-sm font-extrabold text-[#082a5e]">Hallazgo principal</p>
            <p className="mt-1 text-xs leading-relaxed text-[#10233f]">
              Tu día con más actividad es {summary.peak}. El promedio de estas partidas es {summary.average.toFixed(1).replace(".", ",")} sobre 10.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button type="button" onClick={downloadSummary} className={navyBtn}>
            <Download className="size-[18px]" />
            Descargar resumen
          </button>
          <button
            type="button"
            onClick={() => setRows([])}
            className={outlineBtn}
          >
            <RefreshCw className="size-[18px]" />
            Analizar otro CSV
          </button>
        </div>
      </PageBody>
    );
  }

  return (
    <PageBody>
      <div className="flex flex-col gap-4">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#e4f8fd] px-2.5 py-1.5 text-xs font-bold text-[#082a5e]">
          <Sparkles className="size-3.5" />
          Resúmenes IA
        </span>
        <div className="flex flex-col gap-2">
          <PageTitle>Análisis de Resultados de Trivia</PageTitle>
          <PageLead>Pega el contenido de tu archivo CSV para convertir tus partidas en un resumen visual.</PageLead>
        </div>
      </div>

      <div className="rounded-3xl bg-[#e4f8fd] p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-[38px] shrink-0 items-center justify-center rounded-xl bg-white">
            <FileSpreadsheet className="size-5 text-[#082a5e]" />
          </span>
          <div>
            <p className="text-sm font-bold text-[#082a5e]">Formato esperado</p>
            <p className="mt-1 text-xs leading-relaxed text-[#5f7088]">
              fecha,nombre,puntaje
              <br />
              29/09/2026,JUGADOR 1,8
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reports-input" className="text-sm font-semibold text-[#10233f]">
          Contenido CSV <span className="text-[#e64a86]">*</span>
        </label>
        <textarea
          id="reports-input"
          value={reportsText}
          onChange={(event) => setReportsText(event.target.value)}
          placeholder={"fecha,nombre,puntaje\n29/09/2026,JUGADOR 1,8\n27/09/2026,JUGADOR 1,7"}
          className="min-h-[112px] w-full rounded-xl border border-[#dce7f2] bg-white px-4 py-3 text-sm text-[#10233f] outline-none placeholder:text-[#5f7088] focus:border-[#082a5e]"
        />
        <p className="text-xs text-[#5f7088]">Incluye la fila de encabezados. Máximo 500 partidas.</p>
      </div>

      <div className="flex items-start gap-3 rounded-2xl bg-[#fff7d1] p-4">
        <ShieldCheck className="size-5 shrink-0 text-[#e6a900]" />
        <p className="text-xs leading-relaxed text-[#10233f]">
          Revisa que el CSV no incluya información sensible. Solo se usa para generar este análisis.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <button type="button" onClick={handleGenerate} disabled={isLoading} className={yellowBtn}>
          {isLoading ? <Loader2 className="size-[18px] animate-spin" /> : <Sparkles className="size-[18px]" />}
          Generar análisis
        </button>
        <button type="button" onClick={() => setReportsText("")} className={outlineBtn}>
          <Trash2 className="size-[18px]" />
          Limpiar contenido
        </button>
      </div>
    </PageBody>
  );
}
