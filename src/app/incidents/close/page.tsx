
// src/app/incidents/close/page.tsx
import CloseIncidentForm from '@/components/incidents/CloseIncidentForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CloseIncidentPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-2xl">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold font-headline">Cerrar un Incidente</CardTitle>
              <CardDescription className="font-body">
                Selecciona un incidente y añade una observación de cierre para archivarlo.
              </CardDescription>
            </div>
            <Button asChild variant="outline">
              <Link href="/reports">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Panel
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <CloseIncidentForm />
        </CardContent>
      </Card>
    </div>
  );
}
