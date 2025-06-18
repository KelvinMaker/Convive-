
// src/app/incidents/list/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { getIncidentsAction } from '@/app/actions';
import type { Incident } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, ListChecks } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function IncidentListPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIncidents() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getIncidentsAction();
        if (result.success && result.data) {
          setIncidents(result.data);
        } else {
          setError(result.error || "No se pudieron cargar los incidentes.");
          setIncidents([]);
        }
      } catch (err) {
        console.error("Error fetching incidents:", err);
        setError("Error al conectar con el servidor para obtener incidentes.");
        setIncidents([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchIncidents();
  }, []);

  const getRoleDisplayName = (role?: string) => {
    if (!role) return 'Desconocido';
    const roleMap: { [key: string]: string } = {
      'estudiante': 'Estudiante',
      'docente': 'Docente',
      'directivo': 'Directivo',
      'anonimo': 'Anónimo',
    };
    return roleMap[role.toLowerCase()] || role;
  };

  const getTypeBadgeVariant = (type: string): "default" | "destructive" | "secondary" | "outline" | null | undefined => {
    if (type === 'conflicto') return 'destructive';
    if (type === 'logro') return 'default'; // Or a success-like color if you add one
    return 'secondary';
  };
  
  const getTypeDisplayName = (type: string): string => {
    if (type === 'conflicto') return 'Conflicto';
    if (type === 'logro') return 'Logro';
    return type;
  }


  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold font-headline">Todos los Incidentes Reportados</CardTitle>
          </div>
          <CardDescription className="font-body">
            Un listado completo de todos los incidentes y logros registrados en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Cargando incidentes...</span>
            </div>
          ) : error ? (
            <div className="text-center text-destructive py-10">
              <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
              <p>{error}</p>
            </div>
          ) : incidents.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              <ListChecks className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-4">No hay incidentes registrados actualmente.</p>
              <Button asChild>
                <Link href="/incidents/new">Registrar Nuevo Incidente</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Reportado por</TableHead>
                    <TableHead>Rol del Reportante</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell className="font-medium">{incident.title}</TableCell>
                      <TableCell>
                        <Badge variant={getTypeBadgeVariant(incident.type)}>
                          {getTypeDisplayName(incident.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(incident.date), "dd MMM yyyy, HH:mm", { locale: es })}
                      </TableCell>
                      <TableCell>{incident.userName || (incident.isAnonymous ? "Anónimo" : "Desconocido")}</TableCell>
                      <TableCell>
                        <Badge variant={incident.isAnonymous || !incident.userRole ? "secondary" : "outline"}>
                           {getRoleDisplayName(incident.userRole)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

