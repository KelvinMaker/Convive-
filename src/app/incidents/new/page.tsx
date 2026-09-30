import IncidentForm from "@/components/incidents/IncidentForm";
import { PageBody, PageLead, PageTitle } from "@/components/convive/ui";
import { ShieldAlert } from "lucide-react";

export default function NewIncidentPage() {
  return (
    <PageBody>
      <div className="flex flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#fdeaf2] px-2.5 py-1.5 text-xs font-bold text-[#e64a86]">
          <ShieldAlert className="size-3.5" />
          Convivencia escolar
        </span>
        <PageTitle>Registrar incidente</PageTitle>
        <PageLead>Documenta lo ocurrido de forma clara y objetiva. Los campos con * son obligatorios.</PageLead>
      </div>
      <IncidentForm />
    </PageBody>
  );
}
