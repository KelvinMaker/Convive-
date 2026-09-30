import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-6 px-4 pb-8 pt-6", className)}>{children}</div>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-xs font-bold uppercase text-[#06bfea]">{children}</p>;
}

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className="text-2xl font-extrabold leading-[1.15] text-[#061b3d]">{children}</h1>;
}

export function PageLead({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-[#5f7088]">{children}</p>;
}

export const yellowBtn =
  "inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#ffd43b] px-5 text-sm font-bold text-[#061b3d] shadow-[0_8px_22px_rgba(8,42,94,0.08)] disabled:cursor-not-allowed disabled:opacity-60";

export const navyBtn =
  "inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#082a5e] px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60";

export const outlineBtn =
  "inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-[#dce7f2] bg-white px-5 text-sm font-bold text-[#061b3d] disabled:cursor-not-allowed disabled:opacity-60";

export const fieldClass =
  "h-[50px] w-full rounded-xl border border-[#dce7f2] bg-white px-4 text-sm text-[#10233f] shadow-none placeholder:text-[#5f7088] focus-visible:ring-[#082a5e]";

export const areaClass =
  "min-h-[112px] w-full resize-y rounded-xl border border-[#dce7f2] bg-white px-4 py-3 text-sm text-[#10233f] shadow-none placeholder:text-[#5f7088] focus-visible:ring-[#082a5e]";

export function scoreTone(score: number, total: number) {
  const ratio = total > 0 ? score / total : 0;
  if (ratio >= 0.8) return "bg-[#e8f8f0] text-[#18a96b]";
  if (ratio >= 0.7) return "bg-[#e4f8fd] text-[#082a5e]";
  return "bg-[#fff7d1] text-[#e6a900]";
}
