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
            <CardTitle className="text-2xl font-bold font-headline">Resúmenes Inteligentes de Incidentes</CardTitle>
          </div>
          <CardDescription className="font-body">
            Utiliza la inteligencia artificial para generar resúmenes concisos a partir de los reportes de incidentes.
            Pega los reportes en el área de texto, separados por líneas en blanco, para obtener un análisis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AISummaryView />
        </CardContent>
      </Card>
    </div>
  );
}
