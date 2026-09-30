"use client";

import { useUser } from "@/contexts/UserContext";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { playerName, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const needsName = !playerName && pathname !== "/";

  useEffect(() => {
    if (isLoading || !needsName) return;
    router.replace("/");
  }, [isLoading, needsName, router]);

  if (isLoading || needsName) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh] text-center p-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p>{isLoading ? "Cargando aplicación..." : "Escribe tu nombre para continuar..."}</p>
      </div>
    );
  }

  return <>{children}</>;
}
