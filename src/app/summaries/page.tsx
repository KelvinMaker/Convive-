// src/app/summaries/page.tsx
import AISummaryView from '@/components/summaries/AISummaryView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export default function SummariesPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold font-headline">Análisis de Resultados de Trivia</CardTitle>
          </div>
          <CardDescription className="font-body">
            Pega el contenido del archivo CSV con los resultados de la trivia para generar visualizaciones sobre el rendimiento y la actividad.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AISummaryView />
        </CardContent>
      </Card>
    </div>
  );
}
