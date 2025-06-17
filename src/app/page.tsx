// src/app/page.tsx - Dashboard
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Users, ShieldAlert, Trophy, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { useUser } from "@/contexts/UserContext";
import { useEffect, useState } from "react";

interface Metric {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  color?: string;
}

export default function DashboardPage() {
  const { currentUser } = useUser();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 18) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
  }, []);

  const metrics: Metric[] = [
    { title: "Incidentes Reportados Hoy", value: "12", description: "+3 desde ayer", icon: BarChart, color: "text-primary" },
    { title: "Conflictos Activos", value: "5", description: "Requieren atención", icon: ShieldAlert, color: "text-destructive" },
    { title: "Logros Destacados", value: "8", description: "Esta semana", icon: Trophy, color: "text-green-500" },
    { title: "Participación Estudiantil", value: "75%", description: "En reportes anónimos", icon: Users, color: "text-blue-500" },
    { title: "Tendencia de Convivencia", value: "Positiva", description: "Últimos 30 días", icon: TrendingUp, color: "text-emerald-500" },
    { title: "Reportes Anónimos", value: "23", description: "Total este mes", icon: AlertTriangle, color: "text-yellow-600" },
  ];

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          {greeting}, {currentUser?.name || 'Usuario'}!
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
            {/* Placeholder for recent activity feed */}
            <div className="space-y-4">
              {[
                {type: "Logro", text: "Estudiantes de 5A organizaron colecta.", time: "Hace 2 horas"},
                {type: "Conflicto", text: "Discusión en patio durante recreo.", time: "Hace 5 horas"},
                {type: "Logro", text: "Proyecto de reciclaje exitoso.", time: "Ayer"},
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  {item.type === "Logro" ? <Trophy className="h-5 w-5 text-green-500 mt-1" /> : <ShieldAlert className="h-5 w-5 text-destructive mt-1" />}
                  <div>
                    <p className="text-sm font-medium">{item.text}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Incidentes por Tipo (Últimos 7 días)</CardTitle>
            <CardDescription className="font-body">Visualización de la distribución de incidentes.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-64">
            {/* Placeholder for a chart - Recharts could be integrated here */}
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
