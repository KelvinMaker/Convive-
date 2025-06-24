
// src/app/register/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createUserAction } from "@/app/actions";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { SELF_REGISTER_USER_ROLES } from '@/lib/constants';
import type { UserRole } from '@/lib/types';
import { Form, FormField, FormControl, FormItem, FormMessage } from "@/components/ui/form"; 

const RegisterFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  email: z.string().email("Debe ser un email válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  confirmPassword: z.string(),
  role: z.enum(SELF_REGISTER_USER_ROLES.map(role => role.value) as [UserRole, ...UserRole[]], { 
    required_error: "Debes seleccionar un rol.",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof RegisterFormSchema>;

export default function RegisterPage() {
  const { toast } = useToast();
  const { currentUser, isAdminSetupComplete, isLoading: userContextLoading } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", role: "estudiante" },
  });
  
  useEffect(() => {
    if (!userContextLoading) {
      if (currentUser) {
        router.push('/'); 
      } else if (!isAdminSetupComplete) {
        router.push('/setup-admin'); 
      }
    }
  }, [currentUser, isAdminSetupComplete, userContextLoading, router]);

  async function onSubmit(data: RegisterFormValues) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("confirmPassword", data.confirmPassword);
    formData.append("role", data.role);

    try {
      const result = await createUserAction(formData);
      if (result.success && result.user) {
        toast({ title: "Registro Exitoso", description: `Usuario ${result.user.name} creado. Por favor, inicia sesión.` });
        router.push('/login'); 
      } else {
        toast({ title: "Error de Registro", description: result.error || "No se pudo crear la cuenta.", variant: "destructive" });
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

  if (currentUser) return <div className="flex justify-center items-center min-h-screen">Redirigiendo...</div>;
  if (!isAdminSetupComplete && !userContextLoading) return <div className="flex justify-center items-center min-h-screen">Redirigiendo a configuración...</div>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center font-headline">Registrar Nuevo Usuario</CardTitle>
          <CardDescription className="text-center font-body">
            Completa tus datos para crear una cuenta en Convive+.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Label>Nombre Completo</Label>
                    <FormControl>
                      <Input placeholder="Tu Nombre Completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label>Correo Electrónico</Label>
                    <FormControl>
                      <Input type="email" placeholder="usuario@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Label>Contraseña</Label>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <Label>Confirmar Contraseña</Label>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <Label>Rol</Label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SELF_REGISTER_USER_ROLES.map(role => (
                          <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Registrando..." : "Crear Cuenta"}
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-center text-sm">
            ¿Ya tienes una cuenta? <Link href="/login" className="underline text-primary">Inicia Sesión</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
