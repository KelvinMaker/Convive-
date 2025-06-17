
// src/app/setup-admin/page.tsx
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
import { createInitialAdminAction } from "@/app/actions";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const SetupAdminFormSchema = z.object({
  email: z.string().email("Debe ser un email válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

type SetupAdminFormValues = z.infer<typeof SetupAdminFormSchema>;

export default function SetupAdminPage() {
  const { toast } = useToast();
  const { login, isAdminSetupComplete, isLoading: userContextLoading, currentUser } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingAdminStatus, setCheckingAdminStatus] = useState(true);

  const form = useForm<SetupAdminFormValues>({
    resolver: zodResolver(SetupAdminFormSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

   useEffect(() => {
    if (!userContextLoading) {
      if (isAdminSetupComplete) {
        if (currentUser) {
          router.push('/'); // Admin set up and user logged in, redirect to dashboard
        } else {
          router.push('/login'); // Admin set up but user not logged in, redirect to login
        }
      } else {
        // Admin not set up, allow form rendering
        setCheckingAdminStatus(false);
      }
    }
  }, [isAdminSetupComplete, userContextLoading, currentUser, router]);


  async function onSubmit(data: SetupAdminFormValues) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("confirmPassword", data.confirmPassword);

    try {
      // Re-check admin existence just before submission as an extra precaution,
      // though useEffect should prevent form display if admin exists.
      if (isAdminSetupComplete) {
         toast({ title: "Error", description: "Un administrador ya ha sido configurado. Por favor, inicia sesión.", variant: "destructive" });
         router.push('/login');
         setIsSubmitting(false);
         return;
      }

      const result = await createInitialAdminAction(formData);
      if (result.success && result.user) {
        toast({ title: "Administrador Creado", description: "Cuenta de administrador creada exitosamente." });
        login(result.user); 
      } else {
        toast({ title: "Error", description: result.error || "No se pudo crear la cuenta.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error Inesperado", description: "Ocurrió un error. Intenta de nuevo.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (userContextLoading || checkingAdminStatus) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /> <span className="ml-2">Verificando configuración...</span></div>;
  }
  
  // This block is a fallback UI. Ideally, useEffect redirects before this is shown.
  if (isAdminSetupComplete) { 
     return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold font-headline">Administrador ya Configurado</CardTitle>
              <CardDescription className="font-body">
                Ya existe una cuenta de administrador para Convive+.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Por favor, inicia sesión para acceder al panel.</p>
              <Button asChild className="w-full">
                <Link href="/login">Ir a Iniciar Sesión</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
  }

  // If !isAdminSetupComplete and checks are done, render the form
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center font-headline">Configurar Administrador</CardTitle>
          <CardDescription className="text-center font-body">
            Crea la primera cuenta de administrador para Convive+.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" type="email" placeholder="admin@example.com" {...form.register("email")} />
              {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" placeholder="********" {...form.register("password")} />
              {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input id="confirmPassword" type="password" placeholder="********" {...form.register("confirmPassword")} />
              {form.formState.errors.confirmPassword && <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Creando..." : "Crear Administrador"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

