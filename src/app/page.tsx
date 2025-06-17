
// src/app/page.tsx - Dashboard
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Users, ShieldAlert, Trophy, TrendingUp, AlertTriangle, Loader2, Info } from 'lucide-react';
import { useUser } from "@/contexts/UserContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";


interface Metric {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  color?: string;
}

export default function DashboardPage() {
  const { currentUser, isLoading, isAdminSetupComplete } = useUser();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 18) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
  }, []);

  // Metrics are displayed only if a user is logged in
  const metrics: Metric[] = [
    { title: "Incidentes Reportados Hoy", value: "12", description: "+3 desde ayer", icon: BarChart, color: "text-primary" },
    { title: "Conflictos Activos", value: "5", description: "Requieren atención", icon: ShieldAlert, color: "text-destructive" },
    { title: "Logros Destacados", value: "8", description: "Esta semana", icon: Trophy, color: "text-green-500" },
    { title: "Participación Estudiantil", value: "75%", description: "En reportes anónimos", icon: Users, color: "text-blue-500" },
    { title: "Tendencia de Convivencia", value: "Positiva", description: "Últimos 30 días", icon: TrendingUp, color: "text-emerald-500" },
    { title: "Reportes Anónimos", value: "23", description: "Total este mes", icon: AlertTriangle, color: "text-yellow-600" },
  ];

  if (isLoading) {
     return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-8 w-8 animate-spin" /> <span className="ml-2">Cargando panel...</span></div>;
  }

  // AuthGuard should handle redirection if !isAdminSetupComplete or !currentUser
  // This is an additional safeguard or for when AuthGuard is still processing.
  if (!isAdminSetupComplete && !isLoading) {
     return (
      <div className="container mx-auto py-8 px-4 md:px-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Configuración Requerida</h1>
        <p className="mb-6">La aplicación necesita que se configure un administrador inicial.</p>
        <Button asChild><Link href="/setup-admin">Ir a Configuración</Link></Button>
      </div>
    );
  }

  if (!currentUser && isAdminSetupComplete && !isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Bienvenido a Convive+</h1>
        <p className="mb-6">Por favor, inicia sesión para acceder al panel de monitoreo.</p>
        <Button asChild><Link href="/login">Iniciar Sesión</Link></Button>
      </div>
    );
  }
  
  if (!currentUser) {
    // This state should ideally not be reached if AuthGuard works correctly and isLoading is false.
    // It's a fallback.
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
        {metrics.map((metric, index) => (
          <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-body">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-5 w-5 ${metric.color || 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metric.color || ''}`}>{metric.value}</div>
              <p className="text-xs text-muted-foreground pt-1">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Resumen de Actividad Reciente</CardTitle>
            <CardDescription className="font-body">Últimos incidentes y logros reportados.</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Incidentes por Tipo (Últimos 7 días)</CardTitle>
            <CardDescription className="font-body">Visualización de la distribución de incidentes.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-64">
            <div className="text-center">
              <BarChart className="h-24 w-24 text-muted-foreground mx-auto" />
              <p className="mt-2 text-sm text-muted-foreground">Gráfico de ejemplo aquí</p>
              <p className="text-xs text-muted-foreground">(Integrar Recharts o similar)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
