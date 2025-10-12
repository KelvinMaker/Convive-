// src/components/summaries/AISummaryView.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wand2, PieChart, BarChart } from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
} from "recharts";
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';

interface ScoreDistributionData {
  name: string;
  value: number;
}

interface DailyActivityData {
  date: string;
  count: number;
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"];

export default function AISummaryView() {
  const [reportsText, setReportsText] = useState("");
  const [scoreDistribution, setScoreDistribution] = useState<ScoreDistributionData[]>([]);
  const [dailyActivity, setDailyActivity] = useState<DailyActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const processData = (text: string): { scores: ScoreDistributionData[], activity: DailyActivityData[] } | null => {
    const lines = text.trim().split("\n").slice(1); // Skip header row
    if (lines.length === 0) return null;

    const scoreGroups = {
      excellent: 0, // 8-10
      good: 0,      // 6-7
      needsImprovement: 0 // 0-5
    };

    const activityMap = new Map<string, number>();

    lines.forEach(line => {
      const parts = line.split(",").map(part => part.trim().replace(/"/g, ''));
      if (parts.length < 4) return;

      const score = parseInt(parts[1], 10);
      const dateStr = parts[3]; // "dd/MM/yyyy HH:mm:ss"
      
      if (!isNaN(score)) {
        if (score >= 8) scoreGroups.excellent++;
        else if (score >= 6) scoreGroups.good++;
        else scoreGroups.needsImprovement++;
      }

      try {
        const dateObj = parse(dateStr, 'dd/MM/yyyy HH:mm:ss', new Date());
        if (!isNaN(dateObj.getTime())) {
            const formattedDate = format(dateObj, 'dd MMM', { locale: es });
            activityMap.set(formattedDate, (activityMap.get(formattedDate) || 0) + 1);
        }
      } catch (e) {
          console.warn(`Could not parse date: ${dateStr}`);
      }
    });

    const scores: ScoreDistributionData[] = [
      { name: "Excelente (8-10 pts)", value: scoreGroups.excellent },
      { name: "Bueno (6-7 pts)", value: scoreGroups.good },
      { name: "A mejorar (0-5 pts)", value: scoreGroups.needsImprovement },
    ];
    
    const activity = Array.from(activityMap, ([date, count]) => ({ date, count }))
        .sort((a,b) => parse(a.date, 'dd MMM', new Date(), {locale: es}).getTime() - parse(b.date, 'dd MMM', new Date(), {locale: es}).getTime());


    return { scores, activity };
  };

  const handleGenerateCharts = () => {
    if (!reportsText.trim()) {
      toast({
        title: "Entrada Vacía",
        description: "Por favor, pega los datos de la trivia para generar los gráficos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setScoreDistribution([]);
    setDailyActivity([]);

    // Simulate processing time
    setTimeout(() => {
      const processedData = processData(reportsText);

      if (processedData && (processedData.scores.some(s => s.value > 0) || processedData.activity.length > 0)) {
        setScoreDistribution(processedData.scores);
        setDailyActivity(processedData.activity);
        toast({
          title: "Gráficos Generados",
          description: "Se han generado los gráficos a partir de los datos proporcionados.",
        });
      } else {
        toast({
          title: "Error al Procesar",
          description: "No se pudieron generar los gráficos. Verifica el formato de los datos.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="reports-input" className="block text-sm font-medium text-foreground mb-1">
          Datos de Resultados de Trivia (formato CSV)
        </label>
        <Textarea
          id="reports-input"
          placeholder='Pega aquí los datos del archivo CSV descargado, incluyendo la cabecera: "Usuario,Puntaje,Total Preguntas,Fecha"'
          value={reportsText}
          onChange={(e) => setReportsText(e.target.value)}
          className="min-h-[200px] resize-y shadow-sm font-code text-xs"
          aria-label="Entrada de datos de trivia"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Puedes descargar los datos desde el Panel de Monitoreo y pegarlos aquí.
        </p>
      </div>

      <Button onClick={handleGenerateCharts} disabled={isLoading} className="w-full md:w-auto">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generando Gráficos...
          </>
        ) : (
          <>
            <Wand2 className="mr-2 h-4 w-4" />
            Generar Gráficos
          </>
        )}
      </Button>

      {(scoreDistribution.length > 0 || dailyActivity.length > 0) && (
        <div className="mt-8 grid gap-8 md:grid-cols-1 lg:grid-cols-2">
            {scoreDistribution.some(d => d.value > 0) && (
                 <Card className="shadow-lg">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <PieChart className="h-5 w-5" />
                            <CardTitle>Rendimiento General</CardTitle>
                        </div>
                        <CardDescription>Distribución de puntajes de las partidas.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80 w-full">
                        <ResponsiveContainer>
                            <RechartsPieChart>
                                <Pie data={scoreDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {scoreDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {dailyActivity.length > 0 && (
                 <Card className="shadow-lg">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <BarChart className="h-5 w-5" />
                            <CardTitle>Actividad Diaria</CardTitle>
                        </div>
                        <CardDescription>Número de partidas jugadas por día.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80 w-full">
                         <ResponsiveContainer>
                            <RechartsBarChart data={dailyActivity} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                <Tooltip cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.2 }} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                                <Bar dataKey="count" name="Partidas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}
        </div>
      )}
    </div>
  );
}
