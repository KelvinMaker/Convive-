"use client";

import AppLogo from "./AppLogo";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const BACK_HREF: Record<string, string> = {
  "/trivia": "/",
  "/summaries": "/reports",
  "/incidents/new": "/incidents/list",
  "/incidents/list": "/",
  "/incidents/close": "/incidents/list",
};

export default function AppHeader() {
  const { playerName, clearPlayerName, isLoading } = useUser();
  const pathname = usePathname();

  if (isLoading || !playerName) return null;

  const backHref = BACK_HREF[pathname];

  return (
    <header className="flex h-[76px] items-center justify-between border-b border-[#dce7f2] bg-white px-4">
      <div className="flex items-center gap-2.5">
        {backHref ? (
          <Link
            href={backHref}
            aria-label="Volver"
            className="flex size-9 items-center justify-center rounded-xl bg-[#eaf2ff] text-[#082a5e]"
          >
            <ArrowLeft className="size-[18px]" strokeWidth={2.25} />
          </Link>
        ) : null}
        <Link href="/" aria-label="Ir al inicio">
          <AppLogo />
        </Link>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <p className="max-w-[9rem] truncate text-xs font-bold text-[#10233f]">{playerName}</p>
        <button
          type="button"
          onClick={clearPlayerName}
          className="whitespace-nowrap text-[11px] font-semibold text-[#082a5e] underline"
        >
          Cambiar nombre
        </button>
      </div>
    </header>
  );
}
