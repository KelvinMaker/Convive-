
// src/app/trivia/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Gamepad2, CheckCircle2, XCircle, Award, RotateCw, Home } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import triviaData from '@/../data/trivia.json';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { saveTriviaResultAction } from '@/app/actions';

type Question = {
  id: number;
  situacion_pregunta: string;
  opcion_a: string;
  opcion_b: string;
  opcion_c: string;
  correcta: 'opcion_a' | 'opcion_b' | 'opcion_c';
};

type ShuffledQuestion = {
  id: number;
  questionText: string;
  options: { text: string; id: 'opcion_a' | 'opcion_b' | 'opcion_c' }[];
  correctAnswerId: 'opcion_a' | 'opcion_b' | 'opcion_c';
};

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function TriviaPage() {
  const router = useRouter();
  const { currentUser } = useUser();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'finished'>('start');
  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'opcion_a' | 'opcion_b' | 'opcion_c' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleGameFinish = useCallback(async (finalScore: number, totalQuestions: number) => {
    setGameState('finished');
    const formData = new FormData();
    formData.append('score', String(finalScore));
    formData.append('totalQuestions', String(totalQuestions));
    if (currentUser) {
      formData.append('userId', currentUser.id);
      formData.append('userName', currentUser.name);
    }
    try {
      await saveTriviaResultAction(formData);
    } catch (error) {
      console.error("Could not save trivia result:", error);
      // Non-critical, so we don't show a toast to the user
    }
  }, [currentUser]);

  const startGame = useCallback(() => {
    const randomQuestions = shuffleArray(triviaData as Question[]).slice(0, 10);
    
    const preparedQuestions = randomQuestions.map(q => {
      const options = shuffleArray([
        { text: q.opcion_a, id: 'opcion_a' as const },
        { text: q.opcion_b, id: 'opcion_b' as const },
        { text: q.opcion_c, id: 'opcion_c' as const },
      ]);
      return {
        id: q.id,
        questionText: q.situacion_pregunta,
        options: options,
        correctAnswerId: q.correcta,
      };
    });

    setQuestions(preparedQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setGameState('playing');
  }, []);

  const handleAnswer = useCallback((optionId: 'opcion_a' | 'opcion_b' | 'opcion_c') => {
    if (showFeedback) return; // Prevent answering again while feedback is shown

    let newScore = score;
    setSelectedAnswer(optionId);
    if (optionId === questions[currentQuestionIndex].correctAnswerId) {
      newScore = score + 1;
      setScore(newScore);
    }
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        handleGameFinish(newScore, questions.length);
      }
    }, 1500); // Wait 1.5 seconds before moving to the next question
  }, [showFeedback, score, questions, currentQuestionIndex, handleGameFinish]);


  const currentQuestion = useMemo(() => {
    if (gameState === 'playing' && questions.length > 0) {
      return questions[currentQuestionIndex];
    }
    return null;
  }, [gameState, questions, currentQuestionIndex]);


  if (gameState === 'start') {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-150px)] px-4">
        <Card className="w-full max-w-2xl text-center shadow-xl">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Gamepad2 className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold font-headline">Trivia de Convivencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-muted-foreground">
              ¡Bienvenido! Prepárate para poner a prueba tus conocimientos sobre el Manual de Convivencia.
            </p>
            <p>
              Se seleccionarán 10 preguntas al azar. ¡Mucha suerte!
            </p>
            <Button onClick={startGame} size="lg" className="w-full">
              JUGAR
            </Button>
          </CardContent>
           <CardFooter>
            <Button variant="link" className="mx-auto" onClick={() => router.push('/')}>Volver al inicio</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (gameState === 'playing' && currentQuestion) {
    const progress = ((currentQuestionIndex) / questions.length) * 100;
    return (
       <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-150px)] px-4">
        <Card className="w-full max-w-3xl shadow-2xl">
          <CardHeader>
             <CardDescription>Pregunta {currentQuestionIndex + 1} de {questions.length}</CardDescription>
             <Progress value={progress + 10} className="w-full h-2" />
             <CardTitle className="text-2xl font-bold pt-4 font-headline text-center min-h-[90px]">
                {currentQuestion.questionText}
             </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 mt-4">
            {currentQuestion.options.map(option => {
              const isSelected = selectedAnswer === option.id;
              const isCorrect = currentQuestion.correctAnswerId === option.id;
              
              return (
                <Button
                  key={option.id}
                  onClick={() => handleAnswer(option.id)}
                  disabled={showFeedback}
                  className={cn(
                    "w-full h-auto min-h-[60px] text-wrap py-3 px-4 text-base justify-center",
                    showFeedback && isCorrect && "bg-green-600 hover:bg-green-700 animate-pulse",
                    showFeedback && isSelected && !isCorrect && "bg-destructive hover:bg-destructive/90",
                    !showFeedback && "bg-secondary hover:bg-primary/20 text-secondary-foreground"
                  )}
                >
                  {option.text}
                   {showFeedback && isSelected && isCorrect && <CheckCircle2 className="ml-2 h-5 w-5" />}
                   {showFeedback && isSelected && !isCorrect && <XCircle className="ml-2 h-5 w-5" />}
                </Button>
              )
            })}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === 'finished') {
     const getFeedbackMessage = () => {
      const percentage = (score / questions.length) * 100;
      if (percentage === 100) return "¡Excelente! Eres un experto en convivencia.";
      if (percentage >= 70) return "¡Muy bien hecho! Tienes un gran conocimiento del manual.";
      if (percentage >= 50) return "Buen trabajo. Sigue aprendiendo para mejorar.";
      return "Necesitas repasar el manual. ¡No te rindas!";
    };

    return (
       <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-150px)] px-4">
        <Card className="w-full max-w-xl text-center shadow-xl">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Award className="h-16 w-16 text-accent" />
            </div>
            <CardTitle className="text-3xl font-bold font-headline">RESULTADO FINAL</CardTitle>
             <CardDescription className="text-lg pt-2">{getFeedbackMessage()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-5xl font-bold text-primary">{score}<span className="text-3xl text-muted-foreground">/{questions.length}</span></p>
            <p className="text-lg">puntos obtenidos</p>
          </CardContent>
           <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={startGame} size="lg">
              <RotateCw className="mr-2" /> Volver a Jugar
            </Button>
            <Button onClick={() => router.push('/')} size="lg" variant="outline">
              <Home className="mr-2" /> Terminar
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return null; // Should not be reached
}
