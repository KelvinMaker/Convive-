"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowUpRight, Brain, ChartNoAxesCombined, ShieldAlert, Sparkles } from "lucide-react";
import AppLogo from "@/components/AppLogo";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageBody, yellowBtn } from "@/components/convive/ui";

export default function MainPage() {
  const { playerName, setPlayerName } = useUser();
  const router = useRouter();
  const [draftName, setDraftName] = useState("");

  if (!playerName) {
    return (
      <PageBody>
        <div className="flex justify-center">
          <AppLogo />
        </div>
        <img
          src="/universo-convive.png"
          alt="Estudiantes y docente en el universo Convive+"
          className="h-[218px] w-full rounded-3xl object-cover shadow-[0_12px_32px_rgba(6,27,61,0.13)]"
        />
        <div className="flex flex-col items-center gap-2.5 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff7d1] px-2.5 py-1.5 text-xs font-bold text-[#e6a900]">
            <Sparkles className="size-3.5" />
            Tu espacio para aprender y convivir
          </span>
          <h1 className="text-[32px] font-extrabold leading-[1.1] text-[#061b3d]">
            ¡Bienvenido a Convive+!
          </h1>
          <p className="text-sm leading-relaxed text-[#5f7088]">
            Pon a prueba tus conocimientos, revisa tu progreso y construye una mejor convivencia escolar.
          </p>
        </div>
        <div className="rounded-3xl bg-[#e4f8fd] p-4">
          <p className="text-lg font-extrabold text-[#082a5e]">JUGADOR 1</p>
          <p className="mt-1.5 text-xs leading-relaxed text-[#5f7088]">
            Si no escribes un nombre, jugarás como JUGADOR 1. Puedes cambiarlo cuando quieras.
          </p>
        </div>
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            setPlayerName(draftName);
          }}
        >
          <label htmlFor="player-name" className="text-sm font-semibold text-[#10233f]">
            ¿Cómo quieres que te llamemos?
          </label>
          <Input
            id="player-name"
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder="Escribe tu nombre (opcional)"
            maxLength={40}
            autoComplete="nickname"
            className="h-[50px] rounded-xl border-[#dce7f2] bg-white px-4 text-sm shadow-none placeholder:text-[#5f7088] focus-visible:ring-[#082a5e]"
          />
          <p className="text-xs text-[#5f7088]">Tu nombre solo identifica esta sesión.</p>
          <button type="submit" className={yellowBtn}>
            <ArrowRight className="size-[18px]" />
            Continuar
          </button>
        </form>
      </PageBody>
    );
  }

  return (
    <PageBody>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase text-[#06bfea]">Hola, {playerName} 👋</p>
        <h1 className="text-2xl font-extrabold leading-[1.15] text-[#061b3d]">¿Qué quieres hacer hoy?</h1>
        <p className="text-sm leading-relaxed text-[#5f7088]">Elige una experiencia para seguir aprendiendo.</p>
      </div>

      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => router.push("/trivia")}
          className="flex flex-col gap-4 rounded-3xl bg-[#fff7d1] p-5 text-left"
        >
          <div className="flex items-start justify-between">
            <span className="flex size-[52px] items-center justify-center rounded-2xl bg-white">
              <Brain className="size-[27px] text-[#082a5e]" />
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff7d1] px-2.5 py-1.5 text-xs font-bold text-[#e6a900]">
              <ArrowUpRight className="size-3.5" />
              Jugar
            </span>
          </div>
          <div>
            <p className="text-lg font-extrabold text-[#061b3d]">Módulo de Trivia</p>
            <p className="mt-1.5 text-sm leading-relaxed text-[#5f7088]">
              10 preguntas sobre convivencia escolar. Aprende jugando y mejora tu puntaje.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => router.push("/reports")}
          className="flex flex-col gap-4 rounded-3xl bg-[#e4f8fd] p-5 text-left"
        >
          <div className="flex items-start justify-between">
            <span className="flex size-[52px] items-center justify-center rounded-2xl bg-white">
              <ChartNoAxesCombined className="size-[27px] text-[#082a5e]" />
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e4f8fd] px-2.5 py-1.5 text-xs font-bold text-[#082a5e]">
              <ArrowUpRight className="size-3.5" />
              Ver datos
            </span>
          </div>
          <div>
            <p className="text-lg font-extrabold text-[#061b3d]">Módulo de Reportes</p>
            <p className="mt-1.5 text-sm leading-relaxed text-[#5f7088]">
              Consulta tus partidas, promedio y evolución. También puedes analizar un CSV con IA.
            </p>
          </div>
        </button>
      </div>

      <div className="rounded-3xl border border-[#dce7f2] bg-white p-4 shadow-[0_8px_22px_rgba(8,42,94,0.08)]">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#fdeaf2]">
            <ShieldAlert className="size-[22px] text-[#e64a86]" />
          </span>
          <div>
            <p className="text-sm font-bold text-[#10233f]">Gestión de incidentes</p>
            <p className="mt-1 text-xs font-semibold text-[#082a5e]">
              <Link href="/incidents/new" className="underline-offset-2 hover:underline">Registrar incidente</Link>
              <span className="px-1.5 text-[#5f7088]">·</span>
              <Link href="/incidents/list" className="underline-offset-2 hover:underline">Ver listado</Link>
            </p>
          </div>
        </div>
      </div>
    </PageBody>
  );
}
