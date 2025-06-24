
// src/app/page.tsx - Dashboard
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Users, Trophy, TrendingUp, AlertTriangle, Loader2, Info, ListChecks, Download, LayoutDashboard, Sparkles, FolderClosed } from 'lucide-react';
import { useUser } from "@/contexts/UserContext";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getIncidentsAction } from "@/app/actions";
import type { Incident } from "@/lib/types";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ResponsiveContainer, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { PREDEFINED_INCIDENTS_HIERARCHICAL } from "@/lib/constants";


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

export default function DashboardPage() {
  const { currentUser, isLoading: userContextLoading, isAdminSetupComplete } = useUser();
  const [greeting, setGreeting] = useState('');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(true);
  const [incidentsError, setIncidentsError] = useState<string | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 18) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
  }, []);

  useEffect(() => {
    async function fetchIncidents() {
      if (currentUser) { // Only fetch if a user is logged in
        setIsLoadingIncidents(true);
        setIncidentsError(null);
        try {
          const result = await getIncidentsAction();
          if (result.success && result.data) {
            setIncidents(result.data);
          } else {
            setIncidentsError(result.error || "No se pudieron cargar los incidentes.");
            setIncidents([]);
          }
        } catch (error) {
          console.error("Error fetching incidents for dashboard:", error);
          setIncidentsError("Error al conectar con el servidor para obtener incidentes.");
          setIncidents([]);
        } finally {
          setIsLoadingIncidents(false);
        }
      } else {
        // Clear incidents if no user or logged out
        setIncidents([]);
        setIsLoadingIncidents(false);
      }
    }
    fetchIncidents();
  }, [currentUser]);

  const todayISO = new Date().toISOString().split('T')[0];

  const incidentsTodayCount = useMemo(() => {
    return incidents.filter(incident => incident.date.startsWith(todayISO)).length;
  }, [incidents, todayISO]);

  const closedIncidentsCount = useMemo(() => {
    return incidents.filter(incident => incident.status === 'closed').length;
  }, [incidents]);

  const logrosCount = useMemo(() => {
    return incidents.filter(incident => incident.type === 'logro').length;
  }, [incidents]);

  const metrics: Metric[] = useMemo(() => [
    { title: "Incidentes Reportados", value: isLoadingIncidents ? "..." : incidentsTodayCount.toString(), description: incidentsTodayCount === 1 ? "1 nuevo incidente hoy" : `${incidentsTodayCount} nuevos incidentes hoy`, icon: BarChart, color: "text-primary",
      actionButton: (
        <Button asChild size="sm" variant="default" className="w-full">
          <Link href="/incidents/new">Registrar Nuevo Incidente</Link>
        </Button>
      )
    },
    { title: "Incidentes Cerrados", value: isLoadingIncidents ? "..." : closedIncidentsCount.toString(), description: closedIncidentsCount === 1 ? "1 incidente cerrado" : `${closedIncidentsCount} incidentes cerrados`, icon: FolderClosed, color: "text-green-500",
      actionButton: ( <div className="h-9" /> )
    },
    { title: "Logros Destacados", value: isLoadingIncidents ? "..." : logrosCount.toString(), description: "Total logros registrados", icon: Trophy, color: "text-green-500" },
    { title: "Participación Estudiantil", value: "N/A", description: "En reportes anónimos", icon: Users, color: "text-blue-500" },
    { title: "Tendencia de Convivencia", value: "N/A", description: "Últimos 30 días", icon: TrendingUp, color: "text-emerald-500" },
    { title: "Total Reportes", value: isLoadingIncidents ? "..." : incidents.length.toString(), description: "Incidentes y logros", icon: ListChecks, color: "text-purple-500", link: "/incidents/list", clickable: true },
  ], [isLoadingIncidents, incidentsTodayCount, closedIncidentsCount, logrosCount, incidents.length, currentUser?.role]);

  const recentIncidents = useMemo(() => {
    return [...incidents]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [incidents]);

  const titleToCategoryMap = useMemo(() => {
    const map = new Map<string, string>();
    PREDEFINED_INCIDENTS_HIERARCHICAL.forEach(category => {
      category.specificTypes.forEach(specificType => {
        map.set(specificType.value, category.categoryLabel);
      });
    });
    return map;
  }, []);

  const chartData = useMemo(() => {
    if (isLoadingIncidents || incidents.length === 0) return [];
    
    const categoryMap = new Map<string, number>();

    incidents.forEach(incident => {
        const categoryLabel = titleToCategoryMap.get(incident.title);
        if (categoryLabel) {
            categoryMap.set(categoryLabel, (categoryMap.get(categoryLabel) || 0) + 1);
        }
    });
    
    return Array.from(categoryMap, ([name, count]) => ({ name, count }));
  }, [incidents, isLoadingIncidents, titleToCategoryMap]);

  const handleDownloadCSV = () => {
    if (incidents.length === 0) return;

    const headers = ["Fecha de registro", "Categoria", "Tipo especifico", "Descripcion", "Usuario que registra"];
    const csvRows = [headers.join(",")];

    const escapeCSV = (str: string) => `"${str.replace(/"/g, '""')}"`;

    incidents.forEach(incident => {
      const row = [
        escapeCSV(format(new Date(incident.date), "dd/MM/yyyy HH:mm:ss", { locale: es })),
        escapeCSV(titleToCategoryMap.get(incident.title) || 'Desconocida'),
        escapeCSV(incident.title),
        escapeCSV(incident.description),
        escapeCSV(incident.userName || (incident.isAnonymous ? "Anónimo" : "Desconocido")),
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
    <div className="container mx-auto py-8 px-4 md:px-6">
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
          <Link href="/">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Panel de Monitoreo
          </Link>
        </Button>
        {currentUser && ['docente', 'directivo'].includes(currentUser.role) && (
          <Button asChild variant="outline">
            <Link href="/summaries">
              <Sparkles className="mr-2 h-4 w-4" />
              Resúmenes IA
            </Link>
          </Button>
        )}
        {currentUser?.role === 'directivo' && (
            <Button asChild variant="outline">
                <Link href="/incidents/close">
                    <FolderClosed className="mr-2 h-4 w-4"/>
                    Cerrar Incidente
                </Link>
            </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Resumen de Actividad Reciente</CardTitle>
            <CardDescription className="font-body">Últimos incidentes y logros reportados.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingIncidents ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Cargando actividad...</span>
              </div>
            ) : incidentsError ? (
              <div className="text-center text-destructive py-6">
                <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
                <p>Error: {incidentsError}</p>
              </div>
            ) : recentIncidents.length > 0 ? (
              <ul className="space-y-3">
                {recentIncidents.map(incident => (
                  <li key={incident.id} className="p-3 rounded-md border bg-card/50 hover:bg-accent/20 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`font-semibold ${incident.type === 'conflicto' ? 'text-destructive' : 'text-green-600'}`}>
                          {incident.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Reportado por: {incident.userName || (incident.isAnonymous ? "Anónimo" : "Desconocido")}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(incident.date), "dd MMM yyyy, HH:mm", { locale: es })}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="space-y-4 text-center text-muted-foreground py-6">
                <Info className="h-10 w-10 mx-auto mb-2" />
                <p>No hay actividad reciente para mostrar.</p>
                <p className="text-sm">
                  <Link href="/incidents/new" className="text-primary hover:underline">
                    Registra un nuevo incidente
                  </Link>
                  {' '}para comenzar.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Incidentes por Categoría</CardTitle>
            <CardDescription className="font-body mt-1">Visualización de la distribución de incidentes.</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
             <div className="h-96">
                {isLoadingIncidents ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                ) : incidentsError ? (
                    <div className="flex flex-col justify-center items-center h-full text-center text-destructive">
                        <AlertTriangle className="h-12 w-12 mx-auto" />
                        <p className="mt-2">Error al cargar datos del gráfico.</p>
                    </div>
                ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart 
                            data={chartData}
                            margin={{ top: 5, right: 20, left: -10, bottom: 120 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis 
                                dataKey="name" 
                                angle={-60}
                                textAnchor="end" 
                                interval={0}
                                tick={{ fontSize: 10 }}
                                height={110}
                            />
                            <YAxis allowDecimals={false} />
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
                            <Bar dataKey="count" name="Incidentes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex flex-col justify-center items-center h-full text-center text-muted-foreground">
                        <BarChart className="h-24 w-24 mx-auto" />
                        <p className="mt-2 text-sm">No hay datos de incidentes para mostrar.</p>
                    </div>
                )}
             </div>
             <div className="mt-6 flex justify-center">
                 <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadCSV}
                    disabled={isLoadingIncidents || incidents.length === 0}
                >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar CSV
                </Button>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    
