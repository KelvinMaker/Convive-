"use client";

import { CalendarDays, Download, Gamepad2, Loader2, Play, Sparkles, Target, TrendingUp } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { getTriviaStatsAction, getTriviaResultsAction } from "@/app/actions";
import type { TriviaResult } from "@/lib/types";
import { format, isSameMonth, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { Eyebrow, PageBody, PageLead, PageTitle, navyBtn, scoreTone, yellowBtn } from "@/components/convive/ui";

interface TriviaStats {
  gamesPlayed: number;
  averageScore: number;
}

export default function ReportsDashboardPage() {
  const { playerName, isLoading: userContextLoading } = useUser();
  const [triviaStats, setTriviaStats] = useState<TriviaStats>({ gamesPlayed: 0, averageScore: 0 });
  const [triviaResults, setTriviaResults] = useState<TriviaResult[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    setDataError(null);
    try {
      const [triviaStatsResult, allTriviaResults] = await Promise.all([
        getTriviaStatsAction(),
        getTriviaResultsAction(),
      ]);

      if (triviaStatsResult.success && triviaStatsResult.data) {
        setTriviaStats(triviaStatsResult.data);
      } else {
        setTriviaStats({ gamesPlayed: 0, averageScore: 0 });
      }

      if (allTriviaResults.success && allTriviaResults.data) {
        setTriviaResults(allTriviaResults.data);
      } else {
        setDataError(allTriviaResults.error || "No se pudieron cargar los resultados de trivia.");
        setTriviaResults([]);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setDataError("Error al conectar con el servidor para obtener datos.");
      setTriviaStats({ gamesPlayed: 0, averageScore: 0 });
      setTriviaResults([]);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (playerName) fetchData();
  }, [playerName, fetchData]);

  const recentTriviaResults = useMemo(() => {
    return [...triviaResults]
      .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime())
      .slice(0, 5);
  }, [triviaResults]);

  const triviaScoreDistribution = useMemo(() => {
    const scoreMap = new Map<number, number>();
    for (let i = 0; i <= 10; i++) scoreMap.set(i, 0);
    triviaResults.forEach((result) => {
      const score = Math.max(0, Math.min(10, result.score));
      scoreMap.set(score, (scoreMap.get(score) || 0) + 1);
    });
    return Array.from(scoreMap, ([score, count]) => ({ score, count }));
  }, [triviaResults]);

  const monthDelta = useMemo(() => {
    const now = new Date();
    const previous = subMonths(now, 1);
    const avg = (items: TriviaResult[]) =>
      items.length ? items.reduce((sum, item) => sum + item.score, 0) / items.length : null;
    const currentAvg = avg(triviaResults.filter((item) => isSameMonth(new Date(item.playedAt), now)));
    const previousAvg = avg(triviaResults.filter((item) => isSameMonth(new Date(item.playedAt), previous)));
    if (currentAvg === null || previousAvg === null) return null;
    return currentAvg - previousAvg;
  }, [triviaResults]);

  const maxCount = Math.max(1, ...triviaScoreDistribution.map((item) => item.count));

  const handleDownloadTriviaCSV = () => {
    if (triviaResults.length === 0) return;
    const headers = ["Usuario", "Puntaje", "Total Preguntas", "Fecha"];
    const csvRows = [headers.join(",")];
    const escapeCSV = (str: string) => `"${str.replace(/"/g, '""')}"`;
    [...triviaResults].reverse().forEach((result) => {
      csvRows.push(
        [
          escapeCSV(result.userName || "Anónimo"),
          result.score,
          result.totalQuestions,
          escapeCSV(format(new Date(result.playedAt), "dd/MM/yyyy HH:mm:ss", { locale: es })),
        ].join(",")
      );
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "resultados_trivia.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (userContextLoading || (playerName && isLoadingData)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-sm text-[#5f7088]">
        <Loader2 className="size-5 animate-spin text-[#082a5e]" />
        Cargando panel...
      </div>
    );
  }

  if (!playerName) return null;

  const hasGames = triviaResults.length > 0;

  return (
    <PageBody>
      <div className="flex flex-col gap-2">
        <Eyebrow>Hola, {playerName} 👋</Eyebrow>
        <PageTitle>Tu progreso en trivia</PageTitle>
        <PageLead>
          {hasGames
            ? "Consulta tus resultados y descubre cómo estás avanzando."
            : "Aquí aparecerán tus resultados cuando completes una partida."}
        </PageLead>
      </div>

      {!hasGames ? (
        <>
          <div className="flex flex-col items-center gap-5 pt-5 text-center">
            <img src="/empty-reports.svg" alt="" className="size-[148px]" />
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-extrabold text-[#061b3d]">Aún no hay partidas</h2>
              <p className="text-sm leading-relaxed text-[#5f7088]">
                Completa tu primera trivia para ver el promedio, historial y distribución de puntajes.
              </p>
            </div>
            <Link href="/trivia" className={yellowBtn}>
              <Play className="size-[18px]" />
              Jugar mi primera trivia
            </Link>
          </div>
          <div className="rounded-3xl bg-[#e4f8fd] p-4">
            <p className="text-sm font-bold text-[#082a5e]">💡 Cada partida tiene 10 preguntas.</p>
            <p className="mt-4 text-xs leading-relaxed text-[#5f7088]">
              Tus datos se guardan en este dispositivo con el nombre de la sesión.
            </p>
          </div>
          {dataError ? <p className="text-center text-xs text-[#e64a86]">{dataError}</p> : null}
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2.5 rounded-2xl border border-[#dce7f2] bg-white p-4">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#e4f8fd]">
                <Gamepad2 className="size-[18px] text-[#082a5e]" />
              </span>
              <p className="text-2xl font-extrabold text-[#061b3d]">{triviaStats.gamesPlayed}</p>
              <p className="text-xs font-medium text-[#5f7088]">Partidas jugadas</p>
            </div>
            <div className="flex flex-col gap-2.5 rounded-2xl border border-[#dce7f2] bg-white p-4">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#fff7d1]">
                <Target className="size-[18px] text-[#e6a900]" />
              </span>
              <p className="text-2xl font-extrabold text-[#061b3d]">
                {triviaStats.averageScore.toFixed(1).replace(".", ",")}
              </p>
              <p className="text-xs font-medium text-[#5f7088]">Promedio</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-3xl border border-[#dce7f2] bg-white p-5 shadow-[0_8px_22px_rgba(8,42,94,0.08)]">
            <div className="flex items-center justify-between gap-2">
              <p className="text-lg font-extrabold text-[#061b3d]">Últimas cinco partidas</p>
              {monthDelta !== null ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#e8f8f0] px-2.5 py-1.5 text-xs font-bold text-[#18a96b]">
                  <TrendingUp className="size-3.5" />
                  {monthDelta >= 0 ? "+" : ""}
                  {monthDelta.toFixed(1).replace(".", ",")} este mes
                </span>
              ) : null}
            </div>
            <ul>
              {recentTriviaResults.map((result) => (
                <li
                  key={result.id}
                  className="flex min-h-[45px] items-center justify-between border-b border-[#dce7f2] last:border-b-0"
                >
                  <span className="inline-flex items-center gap-2 text-xs text-[#5f7088]">
                    <CalendarDays className="size-[15px]" />
                    {format(new Date(result.playedAt), "d MMM · HH:mm", { locale: es })}
                  </span>
                  <span className={`rounded-full px-2.5 py-1.5 text-xs font-bold ${scoreTone(result.score, result.totalQuestions)}`}>
                    {result.score}/{result.totalQuestions}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4 rounded-3xl border border-[#dce7f2] bg-white p-5 shadow-[0_8px_22px_rgba(8,42,94,0.08)]">
            <div>
              <p className="text-lg font-extrabold text-[#061b3d]">Distribución de puntajes 0–10</p>
              <p className="mt-1 text-xs text-[#5f7088]">Cantidad de partidas por puntaje</p>
            </div>
            <div className="flex h-[142px] items-end gap-1">
              {triviaScoreDistribution.map((item) => {
                const height = item.count === 0 ? 6 : Math.max(10, (item.count / maxCount) * 105);
                const hot = item.score >= 7 && item.count > 0;
                return (
                  <div key={item.score} className="flex h-[130px] min-w-0 flex-1 flex-col items-center gap-1">
                    <div className="flex h-[105px] w-full flex-col justify-end">
                      <div
                        className={`w-full rounded-t ${hot ? "bg-[#06bfea]" : "bg-[#dce7f2]"}`}
                        style={{ height }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-[#5f7088]">{item.score}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button type="button" onClick={handleDownloadTriviaCSV} className={navyBtn}>
              <Download className="size-[18px]" />
              Descargar Historial de Trivia
            </button>
            <p className="text-center text-xs text-[#5f7088]">Se descargará un archivo CSV con tus partidas.</p>
          </div>

          <div className="flex flex-col gap-4 rounded-3xl bg-[#082a5e] p-5">
            <div className="flex items-center justify-between">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-[#06bfea]">
                <Sparkles className="size-[23px] text-white" />
              </span>
              <span className="rounded-full bg-[#fff7d1] px-2.5 py-1.5 text-xs font-bold text-[#e6a900]">Nuevo</span>
            </div>
            <div>
              <p className="text-lg font-extrabold text-white">Resúmenes IA</p>
              <p className="mt-2 text-sm leading-relaxed text-[#c9d9ed]">
                Pega tu historial CSV y obtén hallazgos claros sobre rendimiento y actividad.
              </p>
            </div>
            <Link href="/summaries" className="inline-flex h-[46px] items-center justify-center gap-2 rounded-xl bg-[#ffd43b] text-sm font-bold text-[#061b3d]">
              Analizar resultados
              <span aria-hidden>→</span>
            </Link>
          </div>
        </>
      )}
    </PageBody>
  );
}
