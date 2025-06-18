
// src/app/page.tsx - Dashboard
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Users, ShieldAlert, Trophy, TrendingUp, AlertTriangle, Loader2, Info, ListChecks } from 'lucide-react';
import { useUser } from "@/contexts/UserContext";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getIncidentsAction } from "@/app/actions";
import type { Incident } from "@/lib/types";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Metric {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  color?: string;
  link?: string;
  clickable?: boolean;
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

  const activeConflictsCount = useMemo(() => {
    return incidents.filter(incident => incident.type === 'conflicto').length;
  }, [incidents]);

  const logrosCount = useMemo(() => {
    return incidents.filter(incident => incident.type === 'logro').length;
  }, [incidents]);

  const metrics: Metric[] = useMemo(() => [
    { title: "Incidentes Reportados", value: isLoadingIncidents ? "..." : incidentsTodayCount.toString(), description: incidentsTodayCount === 1 ? "1 nuevo incidente hoy" : `${incidentsTodayCount} nuevos incidentes hoy`, icon: BarChart, color: "text-primary" },
    { title: "Conflictos Activos", value: isLoadingIncidents ? "..." : activeConflictsCount.toString(), description: activeConflictsCount === 1 ? "1 conflicto reportado" : `${activeConflictsCount} conflictos reportados`, icon: ShieldAlert, color: "text-destructive" },
    { title: "Logros Destacados", value: isLoadingIncidents ? "..." : logrosCount.toString(), description: "Total logros registrados", icon: Trophy, color: "text-green-500" },
    { title: "Participación Estudiantil", value: "N/A", description: "En reportes anónimos", icon: Users, color: "text-blue-500" },
    { title: "Tendencia de Convivencia", value: "N/A", description: "Últimos 30 días", icon: TrendingUp, color: "text-emerald-500" },
    { title: "Total Reportes", value: isLoadingIncidents ? "..." : incidents.length.toString(), description: "Incidentes y logros", icon: ListChecks, color: "text-purple-500", link: "/incidents/list", clickable: true },
  ], [isLoadingIncidents, incidentsTodayCount, activeConflictsCount, logrosCount, incidents.length]);

  const recentIncidents = useMemo(() => {
    return [...incidents]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [incidents]);


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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric, index) => {
          const cardComponent = (
            <Card className={`shadow-lg hover:shadow-xl transition-shadow duration-300 ${metric.clickable ? 'cursor-pointer' : ''} flex flex-col`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-body">
                  {metric.title}
                </CardTitle>
                <metric.icon className={`h-5 w-5 ${metric.color || 'text-muted-foreground'}`} />
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-center"> {/* Allow content to grow and center for button case */}
                {metric.title === "Incidentes Reportados" && !isLoadingIncidents && incidentsTodayCount === 0 ? (
                  <div className="text-center pt-2">
                    <p className="text-sm text-muted-foreground mb-3">
                      No hay nuevos incidentes hoy.
                    </p>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 justify-center">
                      <Button asChild size="sm" variant="default">
                        <Link href="/incidents/new">Registrar Incidente</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href="/incidents/list">Ver Incidentes</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={`text-2xl font-bold ${metric.color || ''}`}>{metric.value}</div>
                    <p className="text-xs text-muted-foreground pt-1">
                      {metric.description}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          );
          return metric.link ? (
            <Link href={metric.link} key={index} className="no-underline flex"> {/* Added flex to Link for Card to fill height */}
              {cardComponent}
            </Link>
          ) : (
            <div key={index} className="flex">{cardComponent}</div> /* Added flex for Card to fill height */
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
            <CardTitle className="font-headline">Incidentes por Tipo (Últimos 7 días)</CardTitle>
            <CardDescription className="font-body">Visualización de la distribución de incidentes.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-64">
            {isLoadingIncidents ? (
                 <Loader2 className="h-12 w-12 animate-spin text-primary" />
            ) : incidentsError ? (
                 <AlertTriangle className="h-12 w-12 text-destructive" />
            ): (
              <div className="text-center">
                <BarChart className="h-24 w-24 text-muted-foreground mx-auto" />
                <p className="mt-2 text-sm text-muted-foreground">Gráfico de ejemplo aquí</p>
                <p className="text-xs text-muted-foreground">(Integrar Recharts o similar)</p>
              </div>
            )}
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

