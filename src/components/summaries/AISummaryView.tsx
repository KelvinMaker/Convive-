// src/components/summaries/AISummaryView.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateSummaryAction } from "@/app/actions";
import { Loader2, Wand2 } from "lucide-react";

export default function AISummaryView() {
  const [reportsText, setReportsText] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (!reportsText.trim()) {
      toast({
        title: "Entrada Vacía",
        description: "Por favor, ingresa los reportes de incidentes.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSummary(""); 

    try {
      const result = await generateSummaryAction(reportsText);
      if (result.success && result.summary) {
        setSummary(result.summary);
        toast({
          title: "Resumen Generado",
          description: "El resumen de los incidentes ha sido creado exitosamente.",
        });
      } else {
        toast({
          title: "Error al Generar Resumen",
          description: result.error || "No se pudo generar el resumen.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error Inesperado",
        description: "Ocurrió un error al contactar el servicio de IA.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="reports-input" className="block text-sm font-medium text-foreground mb-1">
          Reportes de Incidentes
        </label>
        <Textarea
          id="reports-input"
          placeholder="Pega aquí los reportes de incidentes, uno por línea o separados por líneas en blanco..."
          value={reportsText}
          onChange={(e) => setReportsText(e.target.value)}
          className="min-h-[200px] resize-y shadow-sm focus:ring-primary focus:border-primary"
          aria-label="Entrada de reportes de incidentes"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Asegúrate de que cada reporte esté claramente separado para un mejor análisis.
        </p>
      </div>

      <Button onClick={handleSummarize} disabled={isLoading} className="w-full md:w-auto">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generando Resumen...
          </>
        ) : (
          <>
            <Wand2 className="mr-2 h-4 w-4" />
            Generar Resumen con IA
          </>
        )}
      </Button>

      {summary && (
        <Card className="mt-6 bg-card shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold font-headline">Resumen Generado</CardTitle>
            <CardDescription>Análisis de los incidentes reportados.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap font-body text-card-foreground">
              {summary}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
