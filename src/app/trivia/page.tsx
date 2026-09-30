"use client";

import { useState, useMemo, useCallback } from "react";
import {
  ArrowRight,
  Award,
  Brain,
  Check,
  CheckCircle2,
  CircleAlert,
  Home,
  Lightbulb,
  ListChecks,
  PartyPopper,
  Play,
  RotateCcw,
  Sparkles,
  Timer,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import triviaData from "@/../data/trivia.json";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { saveTriviaResultAction } from "@/app/actions";
import { PageBody, yellowBtn, outlineBtn, navyBtn } from "@/components/convive/ui";

type Question = {
  id: number;
  situacion_pregunta: string;
  opcion_a: string;
  opcion_b: string;
  opcion_c: string;
  correcta: "opcion_a" | "opcion_b" | "opcion_c";
};

type OptionId = "opcion_a" | "opcion_b" | "opcion_c";

type ShuffledQuestion = {
  id: number;
  questionText: string;
  options: { text: string; id: OptionId }[];
  correctAnswerId: OptionId;
};

const LETTERS = ["A", "B", "C"];

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function TriviaPage() {
  const router = useRouter();
  const { playerName } = useUser();
  const [gameState, setGameState] = useState<"start" | "playing" | "finished">("start");
  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<OptionId | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleGameFinish = useCallback(
    async (finalScore: number, totalQuestions: number) => {
      setGameState("finished");
      const formData = new FormData();
      formData.append("score", String(finalScore));
      formData.append("totalQuestions", String(totalQuestions));
      formData.append("userName", playerName || "JUGADOR 1");
      try {
        await saveTriviaResultAction(formData);
      } catch (error) {
        console.error("Could not save trivia result:", error);
      }
    },
    [playerName]
  );

  const startGame = useCallback(() => {
    const randomQuestions = shuffleArray(triviaData as Question[]).slice(0, 10);
    const preparedQuestions = randomQuestions.map((q) => ({
      id: q.id,
      questionText: q.situacion_pregunta,
      options: shuffleArray([
        { text: q.opcion_a, id: "opcion_a" as const },
        { text: q.opcion_b, id: "opcion_b" as const },
        { text: q.opcion_c, id: "opcion_c" as const },
      ]),
      correctAnswerId: q.correcta,
    }));

    setQuestions(preparedQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setGameState("playing");
  }, []);

  const confirmAnswer = useCallback(() => {
    if (!selectedAnswer || showFeedback || !questions[currentQuestionIndex]) return;
    if (selectedAnswer === questions[currentQuestionIndex].correctAnswerId) {
      setScore((current) => current + 1);
    }
    setShowFeedback(true);
  }, [selectedAnswer, showFeedback, questions, currentQuestionIndex]);

  const goNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      return;
    }
    handleGameFinish(score, questions.length);
  }, [currentQuestionIndex, questions.length, handleGameFinish, score]);

  const currentQuestion = useMemo(() => {
    if (gameState === "playing" && questions.length > 0) {
      return questions[currentQuestionIndex];
    }
    return null;
  }, [gameState, questions, currentQuestionIndex]);

  if (gameState === "start") {
    return (
      <PageBody>
        <div className="flex flex-col items-center gap-4">
          <span className="flex size-[104px] items-center justify-center rounded-full bg-[#fff7d1]">
            <Brain className="size-[52px] text-[#082a5e]" />
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff7d1] px-2.5 py-1.5 text-xs font-bold text-[#e6a900]">
            <Sparkles className="size-3.5" />
            Reto de convivencia
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-extrabold leading-[1.15] text-[#061b3d]">Trivia Convive+</h1>
          <p className="text-sm leading-relaxed text-[#5f7088]">
            Descubre cuánto sabes sobre respeto, empatía y resolución pacífica de conflictos.
          </p>
        </div>
        <div className="flex flex-col gap-4 rounded-3xl border border-[#dce7f2] bg-white p-5 shadow-[0_8px_22px_rgba(8,42,94,0.08)]">
          <p className="text-lg font-extrabold text-[#061b3d]">Antes de comenzar</p>
          <ul className="flex flex-col gap-4">
            {[
              { icon: ListChecks, text: "10 preguntas con tres opciones cada una" },
              { icon: Timer, text: "Sin límite de tiempo: responde con calma" },
              { icon: Lightbulb, text: "Recibirás una explicación después de responder" },
            ].map((rule) => (
              <li key={rule.text} className="flex items-center gap-3">
                <span className="flex size-[34px] shrink-0 items-center justify-center rounded-xl bg-[#e4f8fd]">
                  <rule.icon className="size-[17px] text-[#082a5e]" />
                </span>
                <p className="text-sm leading-snug text-[#10233f]">{rule.text}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <button type="button" onClick={startGame} className={yellowBtn}>
            <Play className="size-[18px]" />
            Comenzar trivia
          </button>
          <button type="button" onClick={() => router.push("/")} className={outlineBtn}>
            Volver al inicio
          </button>
        </div>
      </PageBody>
    );
  }

  if (gameState === "playing" && currentQuestion) {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const correctIndex = currentQuestion.options.findIndex((option) => option.id === currentQuestion.correctAnswerId);
    const correctLetter = LETTERS[correctIndex] ?? "A";
    const correctText = currentQuestion.options[correctIndex]?.text ?? "";
    const isCorrect = selectedAnswer === currentQuestion.correctAnswerId;
    const isLast = currentQuestionIndex === questions.length - 1;

    return (
      <PageBody>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-[#082a5e]">
              Pregunta {currentQuestionIndex + 1} de {questions.length}
            </p>
            <p className="text-xs font-semibold text-[#5f7088]">{Math.round(progress)}%</p>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#dce7f2]">
            <div className="h-2.5 rounded-full bg-[#06bfea]" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className={cn("flex flex-col gap-4", !showFeedback && "rounded-3xl border border-[#dce7f2] bg-white p-5")}>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#e4f8fd] px-2.5 py-1.5 text-xs font-bold text-[#082a5e]">
            {!showFeedback ? <Users className="size-3.5" /> : null}
            Convivencia escolar
          </span>
          <p className={cn("font-extrabold leading-snug text-[#061b3d]", showFeedback ? "text-xl" : "text-[22px]")}>
            {currentQuestion.questionText}
          </p>
          {!showFeedback ? (
            <p className="text-xs text-[#5f7088]">Selecciona una respuesta para continuar.</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          {currentQuestion.options.map((option, index) => {
            const letter = LETTERS[index];
            const selected = selectedAnswer === option.id;
            const correct = currentQuestion.correctAnswerId === option.id;
            return (
              <button
                key={option.id}
                type="button"
                disabled={showFeedback}
                onClick={() => setSelectedAnswer(option.id)}
                className={cn(
                  "flex min-h-[62px] w-full items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-left",
                  !showFeedback && selected && "border-2 border-[#082a5e]",
                  !showFeedback && !selected && "border-[#dce7f2]",
                  showFeedback && correct && "border-2 border-[#18a96b] bg-[#e8f8f0]",
                  showFeedback && selected && !correct && "border-2 border-[#e64a86] bg-[#fdeaf2]",
                  showFeedback && !correct && !selected && "border-[#dce7f2]"
                )}
              >
                <span
                  className={cn(
                    "flex size-[34px] shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    showFeedback && correct && "bg-[#18a96b] text-white",
                    showFeedback && selected && !correct && "bg-[#e64a86] text-white",
                    (!showFeedback || (!correct && !selected)) && "bg-[#dce7f2] text-[#10233f]"
                  )}
                >
                  {letter}
                </span>
                <span className="flex-1 text-sm font-semibold leading-snug text-[#10233f]">{option.text}</span>
                {showFeedback && correct ? <CheckCircle2 className="size-[22px] shrink-0 text-[#18a96b]" /> : null}
                {showFeedback && selected && !correct ? <XCircle className="size-[22px] shrink-0 text-[#e64a86]" /> : null}
              </button>
            );
          })}
        </div>

        {showFeedback ? (
          <div
            className={cn(
              "flex items-start gap-3 rounded-2xl border p-4",
              isCorrect ? "border-[#18a96b] bg-[#e8f8f0]" : "border-[#e64a86] bg-[#fdeaf2]"
            )}
          >
            {isCorrect ? (
              <PartyPopper className="size-[26px] shrink-0 text-[#18a96b]" />
            ) : (
              <CircleAlert className="size-[26px] shrink-0 text-[#e64a86]" />
            )}
            <div className="flex flex-col gap-1">
              <p className={cn("text-lg font-extrabold", isCorrect ? "text-[#18a96b]" : "text-[#e64a86]")}>
                {isCorrect ? "¡Respuesta correcta!" : "Respuesta incorrecta"}
              </p>
              {isCorrect ? (
                <p className="text-xs leading-relaxed text-[#10233f]">
                  Muy bien. La opción correcta es {correctLetter}: {correctText}
                </p>
              ) : (
                <>
                  <p className="text-xs font-bold leading-relaxed text-[#10233f]">
                    La correcta es {correctLetter}: {correctText}
                  </p>
                  <p className="text-xs leading-relaxed text-[#5f7088]">
                    Revisa el manual de convivencia y sigue con la siguiente pregunta.
                  </p>
                </>
              )}
            </div>
          </div>
        ) : null}

        {showFeedback ? (
          <button type="button" onClick={goNext} className={yellowBtn}>
            <ArrowRight className="size-[18px]" />
            {isLast ? "Ver resultado" : "Siguiente pregunta"}
          </button>
        ) : (
          <button type="button" onClick={confirmAnswer} disabled={!selectedAnswer} className={navyBtn}>
            <Check className="size-[18px]" />
            Comprobar respuesta
          </button>
        )}
      </PageBody>
    );
  }

  if (gameState === "finished") {
    const total = questions.length || 10;
    const percentage = Math.round((score / total) * 100);
    const title = percentage >= 80 ? "¡Muy buen trabajo!" : percentage >= 50 ? "Buen trabajo" : "Sigue practicando";
    const lead =
      percentage >= 80
        ? "Tus decisiones muestran que sabes construir una convivencia respetuosa."
        : percentage >= 50
          ? "Vas por buen camino. Repasa el manual para subir tu puntaje."
          : "Cada partida es una oportunidad para conocer mejor el manual.";
    const achievement =
      percentage >= 80 ? "¡Vas por excelente camino!" : percentage >= 50 ? "Puedes mejorar todavía" : "No te rindas";
    const radius = 72;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - percentage / 100);

    return (
      <PageBody>
        <div className="flex flex-col items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff7d1] px-2.5 py-1.5 text-xs font-bold text-[#e6a900]">
            <Trophy className="size-3.5" />
            ¡Trivia completada!
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-extrabold leading-[1.15] text-[#061b3d]">{title}</h1>
          <p className="text-sm leading-relaxed text-[#5f7088]">{lead}</p>
        </div>
        <div className="flex justify-center">
          <div className="relative size-[190px]">
            <svg viewBox="0 0 190 190" className="size-full -rotate-90" aria-hidden>
              <circle cx="95" cy="95" r={radius} fill="none" stroke="#dce7f2" strokeWidth="16" />
              <circle
                cx="95"
                cy="95"
                r={radius}
                fill="none"
                stroke="#e6a900"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-5xl font-extrabold text-[#061b3d]">
                {score}/{total}
              </p>
              <p className="text-xs font-bold text-[#5f7088]">{percentage}% correcto</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl bg-[#e4f8fd] p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#ffd43b]">
              <Award className="size-[23px] text-[#082a5e]" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-[#082a5e]">{achievement}</p>
              <p className="mt-1 text-xs leading-snug text-[#5f7088]">
                Acertaste {score} respuestas de {total}.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <button type="button" onClick={startGame} className={yellowBtn}>
            <RotateCcw className="size-[18px]" />
            Volver a Jugar
          </button>
          <button type="button" onClick={() => router.push("/")} className={outlineBtn}>
            <Home className="size-[18px]" />
            Terminar
          </button>
        </div>
      </PageBody>
    );
  }

  return null;
}
