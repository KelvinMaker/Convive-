
// src/app/reports/page.tsx - Dashboard
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Users, Trophy, TrendingUp, AlertTriangle, Loader2, Info, ListChecks, Download, LayoutDashboard, Sparkles, FolderClosed, Gamepad2, Percent } from 'lucide-react';
import { useUser } from "@/contexts/UserContext";
import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getIncidentsAction, getTriviaStatsAction, getTriviaResultsAction } from "@/app/actions";
import type { Incident, TriviaResult } from "@/lib/types";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ResponsiveContainer, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';


interface Metric {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  color?: string;
  link?: string;
  clickable?: boolean;
  actionButton?: React.ReactNode;
}

interface TriviaStats {
    gamesPlayed: number;
    averageScore: number;
}

export default function ReportsDashboardPage() {
  const { currentUser, isLoading: userContextLoading, isAdminSetupComplete } = useUser();
  const [greeting, setGreeting] = useState('');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [triviaStats, setTriviaStats] = useState<TriviaStats>({ gamesPlayed: 0, averageScore: 0 });
  const [triviaResults, setTriviaResults] = useState<TriviaResult[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 18) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    setDataError(null);
    try {
      const [incidentsResult, triviaStatsResult, allTriviaResults] = await Promise.all([
        getIncidentsAction(),
        getTriviaStatsAction(),
        getTriviaResultsAction(),
      ]);

      if (incidentsResult.success && incidentsResult.data) {
        setIncidents(incidentsResult.data);
      } else {
        setDataError(incidentsResult.error || "No se pudieron cargar los incidentes.");
        setIncidents([]);
      }

      if (triviaStatsResult.success && triviaStatsResult.data) {
        setTriviaStats(triviaStatsResult.data);
      } else {
        console.warn(triviaStatsResult.error || "No se pudieron cargar las estadísticas de trivia.");
        setTriviaStats({ gamesPlayed: 0, averageScore: 0 });
      }

       if (allTriviaResults.success && allTriviaResults.data) {
        setTriviaResults(allTriviaResults.data);
      } else {
        console.warn(allTriviaResults.error || "No se pudieron cargar los resultados de trivia.");
        setTriviaResults([]);
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setDataError("Error al conectar con el servidor para obtener datos.");
      setIncidents([]);
      setTriviaStats({ gamesPlayed: 0, averageScore: 0 });
      setTriviaResults([]);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, fetchData]);

  const metrics: Metric[] = useMemo(() => [
    { title: "Partidas de Trivia Jugadas", value: isLoadingData ? "..." : triviaStats.gamesPlayed.toString(), description: "Total de partidas completadas.", icon: Gamepad2, color: "text-purple-500", link: "/trivia", clickable: true },
    { title: "Puntaje Promedio Trivia", value: isLoadingData ? "..." : `${triviaStats.averageScore.toFixed(1)}/10`, description: "Rendimiento promedio en la trivia.", icon: Percent, color: "text-blue-500", link: "/trivia", clickable: true },
  ], [isLoadingData, triviaStats]);

  const recentTriviaResults = useMemo(() => {
    return [...triviaResults]
      .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime())
      .slice(0, 5);
  }, [triviaResults]);


  const triviaScoreDistribution = useMemo(() => {
    if (isLoadingData || triviaResults.length === 0) return [];
    
    const scoreMap = new Map<number, number>();
    for (let i = 0; i <= 10; i++) {
        scoreMap.set(i, 0);
    }

    triviaResults.forEach(result => {
        scoreMap.set(result.score, (scoreMap.get(result.score) || 0) + 1);
    });
    
    return Array.from(scoreMap, ([score, count]) => ({ score, count }));
  }, [triviaResults, isLoadingData]);

  const handleDownloadIncidentsCSV = () => {
    if (incidents.length === 0) return;
    const headers = ["ID", "Título", "Descripción", "Tipo", "Anónimo", "Fecha", "Reportado por", "Rol"];
    const csvRows = [headers.join(",")];
    const escapeCSV = (str: string | undefined | null) => `"${String(str || '').replace(/"/g, '""')}"`;

    incidents.forEach(incident => {
      const row = [
        incident.id,
        escapeCSV(incident.title),
        escapeCSV(incident.description),
        escapeCSV(incident.type),
        String(incident.isAnonymous),
        escapeCSV(format(new Date(incident.date), "dd/MM/yyyy HH:mm:ss", { locale: es })),
        escapeCSV(incident.userName),
        escapeCSV(incident.userRole),
      ];
      csvRows.push(row.join(","));
    });
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "incidentes.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadTriviaCSV = () => {
    if (triviaResults.length === 0) return;
    const headers = ["Usuario", "Puntaje", "Total Preguntas", "Fecha"];
    const csvRows = [headers.join(",")];
    const escapeCSV = (str: string) => `"${str.replace(/"/g, '""')}"`;
    // Use full triviaResults data, not just recent ones
    [...triviaResults].reverse().forEach(result => {
        const row = [
            escapeCSV(result.userName || 'Anónimo'),
            result.score,
            result.totalQuestions,
            escapeCSV(format(new Date(result.playedAt), "dd/MM/yyyy HH:mm:ss", { locale: es })),
        ];
        csvRows.push(row.join(","));
    });
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "resultados_trivia.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };


  if (userContextLoading) {
     return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-8 w-8 animate-spin" /> <span className="ml-2">Cargando panel...</span></div>;
  }

  if (!isAdminSetupComplete && !userContextLoading) {
     return (
      <div className="container mx-auto py-8 px-4 md:px-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Configuración Requerida</h1>
        <p className="mb-6">La aplicación necesita que se configure un administrador inicial.</p>
        <Button asChild><Link href="/setup-admin">Ir a Configuración</Link></Button>
      </div>
    );
  }

  if (!currentUser && isAdminSetupComplete && !userContextLoading) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Bienvenido a Convive+</h1>
        <p className="mb-6">Por favor, inicia sesión para acceder al panel de monitoreo.</p>
        <Button asChild><Link href="/login">Iniciar Sesión</Link></Button>
      </div>
    );
  }
  
  if (!currentUser) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">Esperando datos de usuario...</div>;
  }


  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          {greeting}, {currentUser.name || 'Usuario'}!
        </h1>
        <p className="text-muted-foreground">
          Bienvenido al Panel de Monitoreo de Convive+. Aquí tienes un resumen del estado de la convivencia.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-4 border-b pb-4">
        <Button asChild variant="default">
          <Link href="/reports">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Panel de Monitoreo
          </Link>
        </Button>
        {currentUser && ['docente', 'directivo'].includes(currentUser.role) && (
          <>
            <Button asChild variant="outline">
              <Link href="/summaries">
                <Sparkles className="mr-2 h-4 w-4" />
                Resúmenes IA
              </Link>
            </Button>
             <Button asChild variant="outline">
                <Link href="/incidents/list">
                  <ListChecks className="mr-2 h-4 w-4" />
                  Ver todos los Incidentes
                </Link>
            </Button>
          </>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {metrics.map((metric, index) => {
          const cardComponent = (
            <Card className={`w-full shadow-lg hover:shadow-xl transition-shadow duration-300 ${metric.clickable ? 'cursor-pointer' : ''} flex flex-col`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-body">
                  {metric.title}
                </CardTitle>
                <metric.icon className={`h-5 w-5 ${metric.color || 'text-muted-foreground'}`} />
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-start">
                 <div>
                  <div className={`text-2xl font-bold ${metric.color || ''}`}>{metric.value}</div>
                  <p className="text-xs text-muted-foreground pt-1">
                    {metric.description}
                  </p>
                </div>
                <div className="pt-2 mt-auto">
                   {metric.actionButton ? metric.actionButton : <div className="h-9" />}
                </div>
              </CardContent>
            </Card>
          );
          return metric.link ? (
            <Link href={metric.link} key={index} className="no-underline flex w-full">
              {cardComponent}
            </Link>
          ) : (
            <div key={index} className="flex w-full">{cardComponent}</div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Últimas 5 Partidas de Trivia</CardTitle>
            <CardDescription className="font-body">Resultados más recientes del juego.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingData ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Cargando resultados...</span>
              </div>
            ) : dataError ? (
              <div className="text-center text-destructive py-6">
                <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
                <p>No se pudieron cargar los datos de la trivia.</p>
              </div>
            ) : recentTriviaResults.length > 0 ? (
              <ul className="space-y-3">
                {recentTriviaResults.map(result => (
                  <li key={result.id} className="p-3 rounded-md border bg-card/50 hover:bg-accent/20 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-primary">
                          {result.userName || "Anónimo"}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(result.playedAt), "dd MMM yyyy, HH:mm", { locale: es })}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-foreground">
                        {result.score}/{result.totalQuestions}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="space-y-4 text-center text-muted-foreground py-6">
                <Info className="h-10 w-10 mx-auto mb-2" />
                <p>No hay resultados de trivia para mostrar.</p>
                <p className="text-sm">
                  <Link href="/trivia" className="text-primary hover:underline">
                    Juega una partida
                  </Link>
                  {' '}para ver los resultados aquí.
                </p>
              </div>
            )}
             <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTriviaCSV}
                disabled={isLoadingData || triviaResults.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar Historial de Trivia
              </Button>
               <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadIncidentsCSV}
                    disabled={isLoadingData || incidents.length === 0}
                >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar CSV de Incidentes
                </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Informe de Resultados de Trivia</CardTitle>
            <CardDescription className="font-body mt-1">Distribución de puntajes obtenidos en todas las partidas.</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
             <div className="h-96">
                {isLoadingData ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                ) : dataError ? (
                    <div className="flex flex-col justify-center items-center h-full text-center text-destructive">
                        <AlertTriangle className="h-12 w-12 mx-auto" />
                        <p className="mt-2">Error al cargar datos del gráfico.</p>
                    </div>
                ) : triviaScoreDistribution.length > 0 && triviaResults.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart 
                            data={triviaScoreDistribution}
                            margin={{ top: 5, right: 20, left: -10, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis 
                                dataKey="score" 
                                tick={{ fontSize: 12 }}
                                label={{ value: 'Puntaje Obtenido', position: 'insideBottom', offset: -10, fontSize: 12 }}
                            />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} label={{ value: 'Nº de Partidas', angle: -90, position: 'insideLeft', offset: 10, fontSize: 12 }} />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'hsl(var(--background))', 
                                    borderColor: 'hsl(var(--border))',
                                    borderRadius: 'var(--radius)',
                                }}
                                labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--foreground))' }}
                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                                cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.2 }}
                            />
                            <Bar dataKey="count" name="Partidas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex flex-col justify-center items-center h-full text-center text-muted-foreground">
                        <BarChart className="h-24 w-24 mx-auto" />
                        <p className="mt-2 text-sm">No hay datos de trivia para mostrar en el gráfico.</p>
                    </div>
                )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    