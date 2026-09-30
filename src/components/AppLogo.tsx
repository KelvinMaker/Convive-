import { Users } from "lucide-react";

export default function AppLogo({ className = "" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  return (
    <span className={`inline-flex items-center gap-[7px] ${className}`}>
      <span className="flex size-[30px] shrink-0 items-center justify-center rounded-[10px] bg-[#082a5e]">
        <Users className="size-[17px] text-white" strokeWidth={2.25} aria-hidden />
      </span>
      <span className="text-[20px] font-extrabold leading-none text-[#082a5e]">
        CONVIVE<span className="text-[#e6a900]">+</span>
      </span>
    </span>
  );
}
