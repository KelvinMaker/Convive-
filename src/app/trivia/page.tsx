
// src/app/trivia/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TriviaPage() {
  const router = useRouter();

  const handleStartGame = () => {
    // Logic to start the game will be implemented here
    console.log("Starting trivia game...");
    // For now, it just stays on the page. We will build the game flow next.
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-150px)] px-4">
      <Card className="w-full max-w-2xl text-center shadow-xl">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Gamepad2 className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline">Trivia de Convivencia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg text-muted-foreground">
            ¡Bienvenido! Prepárate para poner a prueba tus conocimientos sobre el Manual de Convivencia.
          </p>
          <p>
            Se seleccionarán 10 preguntas al azar. ¡Mucha suerte!
          </p>
          <Button onClick={handleStartGame} size="lg" className="w-full">
            JUGAR
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
