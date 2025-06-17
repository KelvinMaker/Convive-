
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
import { createInitialAdminAction, checkAdminExistsAction } from "@/app/actions";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
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
  const { login, isAdminSetupComplete, isLoading: userContextLoading } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const form = useForm<SetupAdminFormValues>({
    resolver: zodResolver(SetupAdminFormSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

   useEffect(() => {
    if (!userContextLoading && isAdminSetupComplete) {
      router.push('/'); // Admin already set up, redirect to dashboard
    } else if (!userContextLoading && !isAdminSetupComplete) {
      setCheckingAdmin(false); // Allow rendering the form
    }
  }, [isAdminSetupComplete, userContextLoading, router]);


  async function onSubmit(data: SetupAdminFormValues) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("confirmPassword", data.confirmPassword);

    try {
      const result = await createInitialAdminAction(formData);
      if (result.success && result.user) {
        toast({ title: "Administrador Creado", description: "Cuenta de administrador creada exitosamente." });
        login(result.user); // Log in the new admin user
        // router.push('/'); // Login function will redirect
      } else {
        toast({ title: "Error", description: result.error || "No se pudo crear la cuenta.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error Inesperado", description: "Ocurrió un error. Intenta de nuevo.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (userContextLoading || checkingAdmin) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /> <span className="ml-2">Verificando configuración...</span></div>;
  }
  
  if (isAdminSetupComplete) { // Should be caught by useEffect, but as a fallback
     return <div className="flex justify-center items-center min-h-screen">Redirigiendo...</div>;
  }

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
