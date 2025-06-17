// src/components/incidents/IncidentForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { INCIDENT_TYPES } from "@/lib/constants";
import type { IncidentType }
from "@/lib/types";
import { submitIncidentAction } from "@/app/actions";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const incidentFormSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres.").max(100, "El título no puede exceder los 100 caracteres."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres.").max(1000, "La descripción no puede exceder los 1000 caracteres."),
  type: z.enum(["conflicto", "logro"], {
    required_error: "Debes seleccionar un tipo de incidente.",
  }),
  isAnonymous: z.boolean().default(false).optional(),
});

type IncidentFormValues = z.infer<typeof incidentFormSchema>;

export default function IncidentForm() {
  const { toast } = useToast();
  const { currentUser } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "conflicto",
      isAnonymous: false,
    },
  });

  async function onSubmit(data: IncidentFormValues) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("type", data.type);
    formData.append("isAnonymous", String(data.isAnonymous));
    
    if (currentUser && !data.isAnonymous) {
      formData.append("userId", currentUser.id);
      formData.append("userName", currentUser.name);
      formData.append("userRole", currentUser.role);
    } else {
       formData.append("userId", "anonimo");
       formData.append("userName", "Usuario Anónimo");
       formData.append("userRole", "anonimo");
    }


    try {
      const result = await submitIncidentAction(formData);
      if (result.success) {
        toast({
          title: "Incidente Registrado",
          description: "Tu reporte ha sido enviado exitosamente.",
        });
        form.reset();
        router.push("/"); // Redirect to dashboard or incident list
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo registrar el incidente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error Inesperado",
        description: "Ocurrió un error. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título del Incidente</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Discusión en el aula" {...field} />
              </FormControl>
              <FormDescription>
                Un resumen breve del incidente.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción Detallada</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe lo ocurrido, personas involucradas, lugar, fecha y hora aproximada..."
                  className="resize-y min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo de Incidente</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-4"
                >
                  {INCIDENT_TYPES.map((type) => (
                    <FormItem key={type.value} className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value={type.value} />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {type.label}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isAnonymous"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Reportar de forma anónima
                </FormLabel>
                <FormDescription>
                  Si marcas esta opción, tu identidad no será revelada.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Enviando..." : "Registrar Incidente"}
        </Button>
      </form>
    </Form>
  );
}
