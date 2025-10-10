
// src/app/page.tsx - Main Landing Page
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Gamepad2 } from "lucide-react";
import Link from "next/link";
import AppLogo from "@/components/AppLogo";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";

export default function MainPage() {
    const { currentUser } = useUser();
    const router = useRouter();

    const handleNavigation = (path: string) => {
        if (!currentUser) {
            router.push('/login');
        } else {
            router.push(path);
        }
    };

    return (
        <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-150px)] px-4">
            <div className="text-center mb-12">
                <div className="flex justify-center mb-4">
                   <AppLogo size="lg" />
                </div>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Una herramienta para fortalecer la convivencia escolar a través del seguimiento de incidentes y el aprendizaje interactivo.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <FileText className="h-10 w-10 text-primary" />
                            <div>
                                <CardTitle className="text-2xl font-bold font-headline">Módulo de Reportes</CardTitle>
                                <CardDescription>
                                    Gestión y seguimiento de incidentes de convivencia.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-muted-foreground mb-6">
                            Accede al panel para registrar, visualizar y administrar los reportes de incidentes y logros en la comunidad educativa.
                        </p>
                    </CardContent>
                    <div className="p-6 pt-0">
                         <Button onClick={() => handleNavigation('/reports')} className="w-full" size="lg">
                            Ir a Reportes
                        </Button>
                    </div>
                </Card>

                <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Gamepad2 className="h-10 w-10 text-accent-foreground bg-accent p-2 rounded-lg" />
                            <div>
                                <CardTitle className="text-2xl font-bold font-headline">Módulo de Trivia</CardTitle>
                                <CardDescription>
                                    Juega y aprende sobre el Manual de Convivencia.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-muted-foreground mb-6">
                            Participa en un divertido juego de trivia para poner a prueba tus conocimientos sobre los deberes y derechos en la institución.
                        </p>
                    </CardContent>
                    <div className="p-6 pt-0">
                        <Button onClick={() => handleNavigation('/trivia')} className="w-full" variant="secondary" size="lg">
                            Ir a Jugar
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
