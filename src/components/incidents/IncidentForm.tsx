"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { INCIDENT_TYPES, PREDEFINED_INCIDENTS_HIERARCHICAL, type SpecificIncident } from "@/lib/constants";
import { submitIncidentAction } from "@/app/actions";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ClipboardList, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { areaClass, fieldClass, navyBtn, outlineBtn } from "@/components/convive/ui";

const incidentFormSchema = z.object({
  incidentCategory: z.string().min(1, "Debes seleccionar una categoría para el incidente."),
  title: z.string().min(1, "Debes seleccionar un tipo específico de incidente."),
  description: z.string().min(10, "La descripción detallada debe tener al menos 10 caracteres.").max(1000),
  type: z.enum(["conflicto", "logro"], { required_error: "Debes seleccionar un tipo de reporte." }),
  isAnonymous: z.boolean().default(false),
});

type IncidentFormValues = z.infer<typeof incidentFormSchema>;

export default function IncidentForm() {
  const { toast } = useToast();
  const { playerName } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategoryValue, setSelectedCategoryValue] = useState("");
  const [specificIncidentOptions, setSpecificIncidentOptions] = useState<SpecificIncident[]>([]);

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues: {
      incidentCategory: "",
      title: "",
      description: "",
      type: "conflicto",
      isAnonymous: false,
    },
  });

  useEffect(() => {
    if (selectedCategoryValue) {
      const category = PREDEFINED_INCIDENTS_HIERARCHICAL.find((cat) => cat.categoryValue === selectedCategoryValue);
      setSpecificIncidentOptions(category ? category.specificTypes : []);
      form.setValue("title", "");
    } else {
      setSpecificIncidentOptions([]);
      form.setValue("title", "");
    }
  }, [selectedCategoryValue, form]);

  async function onSubmit(data: IncidentFormValues) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("type", data.type);
    formData.append("isAnonymous", String(data.isAnonymous));

    if (playerName && !data.isAnonymous) {
      formData.append("userId", playerName);
      formData.append("userName", playerName);
    } else {
      formData.append("userId", "anonimo");
      formData.append("userName", "Usuario Anónimo");
      formData.append("userRole", "anonimo");
    }

    try {
      const result = await submitIncidentAction(formData);
      if (result.success) {
        toast({ title: "Incidente registrado", description: "Tu reporte quedó guardado." });
        router.push("/incidents/list");
      } else {
        toast({ title: "Error", description: result.error || "No se pudo registrar el incidente.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error inesperado", description: "Ocurrió un error. Intenta de nuevo.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-[#dce7f2] bg-white p-5 shadow-[0_8px_22px_rgba(8,42,94,0.08)]">
          <div className="flex items-center gap-2">
            <ClipboardList className="size-5 text-[#082a5e]" />
            <p className="text-lg font-extrabold text-[#061b3d]">Qué ocurrió</p>
          </div>

          <FormField
            control={form.control}
            name="incidentCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-[#10233f]">
                  Categoría <span className="text-[#e64a86]">*</span>
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedCategoryValue(value);
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Selecciona una categoría" />
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
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedCategoryValue && specificIncidentOptions.length > 0 ? (
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-[#10233f]">
                    Tipo de incidente <span className="text-[#e64a86]">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className={fieldClass}>
                        <SelectValue placeholder="Selecciona un tipo" />
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
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-[#10233f]">
                  Tipo de reporte <span className="text-[#e64a86]">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Conflicto o logro" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INCIDENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-[#10233f]">
                  Descripción del incidente <span className="text-[#e64a86]">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe los hechos sin emitir juicios..."
                    className={areaClass}
                    {...field}
                  />
                </FormControl>
                <p className="text-xs text-[#5f7088]">Incluye qué pasó, quiénes estaban presentes y cómo terminó.</p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isAnonymous"
          render={({ field }) => (
            <FormItem>
              <button
                type="button"
                onClick={() => field.onChange(!field.value)}
                className="flex w-full items-start gap-3 rounded-2xl bg-[#e4f8fd] p-4 text-left"
              >
                <span className={`flex size-6 shrink-0 items-center justify-center rounded-md ${field.value ? "bg-[#082a5e] text-white" : "border border-[#dce7f2] bg-white"}`}>
                  {field.value ? "✓" : ""}
                </span>
                <span>
                  <span className="block text-sm font-bold text-[#082a5e]">Reportar de forma anónima</span>
                  <span className="mt-1 block text-xs leading-relaxed text-[#5f7088]">
                    Si lo marcas, tu nombre no quedará asociado al reporte.
                  </span>
                </span>
              </button>
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-3">
          <Button type="submit" disabled={isSubmitting} className={navyBtn}>
            {isSubmitting ? <Loader2 className="size-[18px] animate-spin" /> : <Save className="size-[18px]" />}
            Registrar incidente
          </Button>
          <Link href="/incidents/list" className={outlineBtn}>
            Cancelar
          </Link>
        </div>
      </form>
    </Form>
  );
}
