// src/app/incidents/list/page.tsx
"use client";

import { useEffect, useState, useCallback } from 'react';
import { getIncidentsAction, deleteIncidentAction } from '@/app/actions';
import type { Incident } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, AlertTriangle, ListChecks, Trash2, Edit3, ShieldAlert, Trophy, CalendarOff, ArrowLeft } from 'lucide-react';
import { format, isValid, add } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { useToast } from "@/hooks/use-toast";


export default function IncidentListPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useUser();
  const { toast } = useToast();

  const fetchIncidents = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleDeleteIncident = async (incidentId: string) => {
    try {
      const result = await deleteIncidentAction(incidentId);
      if (result.success) {
        toast({ title: "Incidente Eliminado", description: "El incidente ha sido eliminado correctamente." });
        fetchIncidents(); // Refresh the list
      } else {
        toast({ title: "Error al Eliminar", description: result.error || "No se pudo eliminar el incidente.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error Inesperado", description: "Ocurrió un error al eliminar el incidente.", variant: "destructive" });
    }
  };

  const handleEditIncident = (incidentId: string) => {
    // Placeholder for edit functionality
    toast({ title: "Función no Implementada", description: "La edición de incidentes aún no está disponible." });
    console.log("Edit incident:", incidentId);
  };

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
    if (type === 'logro') return 'default';
    return 'secondary';
  };
  
  const getTypeDisplayName = (type: string): string => {
    if (type === 'conflicto') return 'Conflicto';
    if (type === 'logro') return 'Logro';
    return type;
  }

  const getTypeIcon = (type: string) => {
    if (type === 'conflicto') return <ShieldAlert className="h-4 w-4 mr-1 inline-block" />;
    if (type === 'logro') return <Trophy className="h-4 w-4 mr-1 inline-block" />;
    return null;
  }


  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <ListChecks className="h-6 w-6 text-primary" />
                  <CardTitle className="text-2xl font-bold font-headline">Todos los Incidentes Reportados</CardTitle>
                </div>
                <CardDescription className="font-body">
                  Un listado completo de todos los incidentes y logros registrados en el sistema.
                </CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al Panel Principal
                </Link>
              </Button>
            </div>
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
                    <TableHead>Vence el</TableHead>
                    <TableHead>Reportado por</TableHead>
                    <TableHead>Rol del Reportante</TableHead>
                    {currentUser?.role === 'directivo' && <TableHead className="text-right">Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.map((incident) => {
                    const incidentDate = new Date(incident.date);
                    // The expiration date is calculated as 30 days after the incident's registration date.
                    // This ensures that all incidents, new or old, will display a correct expiration date.
                    const expirationDate = add(incidentDate, { days: 30 });
                    
                    return (
                    <TableRow key={incident.id}>
                      <TableCell className="font-medium">{incident.title}</TableCell>
                      <TableCell>
                        <Badge variant={getTypeBadgeVariant(incident.type)} className="flex items-center">
                          {getTypeIcon(incident.type)}
                          {getTypeDisplayName(incident.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isValid(incidentDate) ? format(incidentDate, "dd MMM yyyy, HH:mm", { locale: es }) : 'Fecha inválida'}
                      </TableCell>
                       <TableCell>
                        {isValid(expirationDate) ? (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <CalendarOff className="h-3.5 w-3.5"/>
                            {format(expirationDate, "dd MMM yyyy", { locale: es })}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{incident.userName || (incident.isAnonymous ? "Anónimo" : "Desconocido")}</TableCell>
                      <TableCell>
                        <Badge variant={incident.isAnonymous || !incident.userRole ? "secondary" : "outline"}>
                           {getRoleDisplayName(incident.userRole)}
                        </Badge>
                      </TableCell>
                      {currentUser?.role === 'directivo' && (
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditIncident(incident.id)}
                              title="Editar Incidente"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" title="Eliminar Incidente">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Esto eliminará permanentemente el incidente
                                    del sistema.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteIncident(incident.id)}
                                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
