
// src/app/login/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { loginUserAction } from "@/app/actions";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const LoginFormSchema = z.object({
  email: z.string().email("Debe ser un email válido."),
  password: z.string().min(1, "La contraseña es requerida."),
});

type LoginFormValues = z.infer<typeof LoginFormSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const { login, currentUser, isAdminSetupComplete, isLoading: userContextLoading } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: { email: "", password: "" },
  });
  
  useEffect(() => {
    if (!userContextLoading) {
      if (currentUser) {
        router.push('/'); // Already logged in
      } else if (!isAdminSetupComplete) {
        router.push('/setup-admin'); // Admin not set up
      }
    }
  }, [currentUser, isAdminSetupComplete, userContextLoading, router]);


  async function onSubmit(data: LoginFormValues) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    try {
      const result = await loginUserAction(formData);
      if (result.success && result.user) {
        toast({ title: "Inicio de Sesión Exitoso", description: `Bienvenido de nuevo, ${result.user.name}.` });
        login(result.user);
        // router.push('/'); // login function will redirect
      } else {
        toast({ title: "Error de Inicio de Sesión", description: result.error || "Credenciales incorrectas.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error Inesperado", description: "Ocurrió un error. Intenta de nuevo.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (userContextLoading) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /> <span className="ml-2">Cargando...</span></div>;
  }

  // If redirected by useEffect, this content might not show, which is fine.
  if (currentUser) return <div className="flex justify-center items-center min-h-screen">Redirigiendo...</div>;
  if (!isAdminSetupComplete && !userContextLoading) return <div className="flex justify-center items-center min-h-screen">Redirigiendo a configuración...</div>;


  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center font-headline">Iniciar Sesión en Convive+</CardTitle>
          <CardDescription className="text-center font-body">
            Ingresa tus credenciales para acceder al panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" type="email" placeholder="usuario@example.com" {...form.register("email")} />
              {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" placeholder="********" {...form.register("password")} />
              {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Ingresando..." : "Iniciar Sesión"}
            </Button>
          </form>
          {/* Add link to password recovery or contact admin in the future */}
          {/* <p className="mt-4 text-center text-sm">
            ¿Problemas para ingresar? <Link href="/ayuda" className="underline text-primary">Contacta al administrador</Link>.
          </p> */}
        </CardContent>
      </Card>
    </div>
  );
}

