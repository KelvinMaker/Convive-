import { Suspense } from "react";
import CloseIncidentForm from "@/components/incidents/CloseIncidentForm";
import { PageBody, PageLead, PageTitle } from "@/components/convive/ui";
import { ShieldAlert } from "lucide-react";

export default function CloseIncidentPage() {
  return (
    <PageBody>
      <div className="flex flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#fdeaf2] px-2.5 py-1.5 text-xs font-bold text-[#e64a86]">
          <ShieldAlert className="size-3.5" />
          Cierre de caso
        </span>
        <PageTitle>Cerrar incidente</PageTitle>
        <PageLead>Registra el resultado del seguimiento antes de cambiar el estado a Cerrado.</PageLead>
      </div>
      <Suspense fallback={<p className="text-sm text-[#5f7088]">Cargando formulario...</p>}>
        <CloseIncidentForm />
      </Suspense>
    </PageBody>
  );
}
