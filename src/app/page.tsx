
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
        <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-120px)] w-full px-4 py-8">
            <div className="text-center mb-10">
                <div className="flex justify-center mb-4">
                   <AppLogo size="lg" />
                </div>
                <p className="text-md sm:text-base text-muted-foreground max-w-sm sm:max-w-md mx-auto">
                    Una herramienta para fortalecer la convivencia escolar a través del seguimiento de incidentes y el aprendizaje interactivo.
                </p>
            </div>

            <div className="flex flex-col gap-8 w-full max-w-md">
                
                <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col">
                    <CardHeader>
                        <div className="flex flex-col items-center text-center gap-3">
                             <Gamepad2 className="h-12 w-12 text-accent-foreground bg-accent p-2 rounded-lg" />
                            <div>
                                <CardTitle className="text-2xl font-bold font-headline">Módulo de Trivia</CardTitle>
                                <CardDescription className="text-base">
                                    Juega y aprende sobre el Manual de Convivencia.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow text-center">
                        <p className="text-muted-foreground text-sm mb-6">
                            Participa en un divertido juego para poner a prueba tus conocimientos sobre los deberes y derechos en la institución.
                        </p>
                    </CardContent>
                    <div className="p-6 pt-0">
                        <Button onClick={() => handleNavigation('/trivia')} className="w-full" variant="secondary" size="lg">
                            Ir a Jugar
                        </Button>
                    </div>
                </Card>

                <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col">
                    <CardHeader>
                        <div className="flex flex-col items-center text-center gap-3">
                            <FileText className="h-12 w-12 text-primary" />
                            <div>
                                <CardTitle className="text-2xl font-bold font-headline">Módulo de Reportes</CardTitle>
                                <CardDescription className="text-base">
                                    Gestión y seguimiento de incidentes de convivencia.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow text-center">
                        <p className="text-muted-foreground text-sm mb-6">
                            Accede al panel para registrar, visualizar y administrar los reportes de incidentes y logros en la comunidad educativa.
                        </p>
                    </CardContent>
                    <div className="p-6 pt-0">
                         <Button onClick={() => handleNavigation('/reports')} className="w-full" size="lg">
                            Ir a Reportes
                        </Button>
                    </div>
                </Card>

            </div>
        </div>
    );
}
