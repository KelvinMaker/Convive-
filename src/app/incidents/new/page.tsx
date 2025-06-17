// src/app/incidents/new/page.tsx
import IncidentForm from '@/components/incidents/IncidentForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewIncidentPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-2xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold font-headline">Registrar Nuevo Incidente</CardTitle>
          <CardDescription className="font-body">
            Completa el formulario para reportar un conflicto o un logro en la convivencia escolar.
            Tu participación es importante para mejorar nuestro entorno.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IncidentForm />
        </CardContent>
      </Card>
    </div>
  );
}
