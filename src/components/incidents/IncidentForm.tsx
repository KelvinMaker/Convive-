
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { INCIDENT_TYPES, PREDEFINED_INCIDENTS_HIERARCHICAL, type SpecificIncident } from "@/lib/constants";
import type { IncidentType } from "@/lib/types";
import { submitIncidentAction } from "@/app/actions";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const incidentFormSchema = z.object({
  incidentCategory: z.string({
    required_error: "Debes seleccionar una categoría para el incidente.",
  }).min(1, "Debes seleccionar una categoría para el incidente."),
  title: z.string({ // This will now hold the specific incident type
    required_error: "Debes seleccionar un tipo específico de incidente.",
  }).min(1, "Debes seleccionar un tipo específico de incidente."),
  description: z.string().min(10, "La descripción detallada debe tener al menos 10 caracteres.").max(1000, "La descripción detallada no puede exceder los 1000 caracteres."),
  type: z.enum(["conflicto", "logro"], {
    required_error: "Debes seleccionar un tipo de reporte.",
  }),
  isAnonymous: z.boolean().default(false).optional(),
});

type IncidentFormValues = z.infer<typeof incidentFormSchema>;

export default function IncidentForm() {
  const { toast } = useToast();
  const { currentUser } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategoryValue, setSelectedCategoryValue] = useState<string>("");
  const [specificIncidentOptions, setSpecificIncidentOptions] = useState<SpecificIncident[]>([]);

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues: {
      incidentCategory: "",
      title: "", // Specific incident type
      description: "",
      type: "conflicto",
      isAnonymous: false,
    },
  });

  useEffect(() => {
    if (selectedCategoryValue) {
      const category = PREDEFINED_INCIDENTS_HIERARCHICAL.find(
        (cat) => cat.categoryValue === selectedCategoryValue
      );
      setSpecificIncidentOptions(category ? category.specificTypes : []);
      form.setValue("title", ""); // Reset specific incident when category changes
    } else {
      setSpecificIncidentOptions([]);
      form.setValue("title", "");
    }
  }, [selectedCategoryValue, form]);

  async function onSubmit(data: IncidentFormValues) {
    setIsSubmitting(true);
    const formData = new FormData();
    // The 'title' field now correctly holds the specific incident type from the second dropdown
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
        setSelectedCategoryValue(""); // Reset category selection
        router.push("/"); 
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
          name="incidentCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría del Incidente</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  setSelectedCategoryValue(value);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la categoría principal..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PREDEFINED_INCIDENTS_HIERARCHICAL.map((category) => (
                    <SelectItem key={category.categoryValue} value={category.categoryValue}>
                      {category.categoryLabel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Elige la categoría general del incidente.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedCategoryValue && specificIncidentOptions.length > 0 && (
          <FormField
            control={form.control}
            name="title" // This field now represents the specific incident type
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo Específico de Incidente</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo específico..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {specificIncidentOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Selecciona el detalle del incidente. Esto será el título principal del reporte.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción Detallada Adicional</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe detalles adicionales, personas involucradas, lugar, fecha y hora aproximada si es necesario..."
                  className="resize-y min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Proporciona cualquier información adicional que consideres relevante.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo de Reporte</FormLabel>
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
        <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting || !form.formState.isValid}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Enviando..." : "Registrar Incidente"}
        </Button>
      </form>
    </Form>
  );
}
