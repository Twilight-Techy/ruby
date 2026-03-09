'use client';

import { useState } from 'react';
import { CaretLeft, CheckCircle, Question, Exam } from '@phosphor-icons/react/dist/ssr';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Props {
    quiz: any;
    questions: any[];
}

export default function ActiveQuiz({ quiz, questions }: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const currentQ = questions[currentIndex];

    const handleSelect = (idx: number) => {
        if (isAnswered) return;
        setSelectedOption(idx);
        setIsAnswered(true);

        if (String(idx) === currentQ.correctOptionIndex) {
            setScore(s => s + 1);
        }
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(c => c + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setIsFinished(true);
            submitScore();
        }
    };

    const submitScore = async () => {
        try {
            await fetch('/api/quizzes/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quizId: quiz.id, score: `${score + (String(selectedOption) === currentQ.correctOptionIndex ? 1 : 0)}/${questions.length}` })
            });
        } catch (err) {
            console.error(err);
        }
    };

    if (isFinished) {
        return (
            <main className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '48px' }}>
                    <CheckCircle size={64} color="var(--color-primary-blue)" weight="fill" style={{ marginBottom: '24px' }} />
                    <h1 className="heading-xl" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Quiz Complete!</h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', marginBottom: '32px' }}>
                        You scored {score} out of {questions.length}.
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <Link href={`/notes/${quiz.noteId}`} className="glass-card" style={{ padding: '12px 24px', fontWeight: 600 }}>Back to Note</Link>
                        <Link href="/quizzes" className="btn-primary">View All Quizzes</Link>
                    </div>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="page-container">
            <Link href="/quizzes" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', marginBottom: '32px', fontWeight: 500 }}>
                <CaretLeft weight="bold" /> Leave Quiz
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                <h1 className="heading-xl" style={{ fontSize: '2rem', margin: 0 }}>{quiz.title}</h1>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 600 }}>
                    Question {currentIndex + 1} of {questions.length}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="glass-card"
                    style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }}
                >
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '32px', lineHeight: '1.6' }}>
                        {currentQ.questionText}
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {currentQ.options.map((opt: string, idx: number) => {
                            const isCorrect = String(idx) === currentQ.correctOptionIndex;
                            const isSelected = selectedOption === idx;

                            let bg = 'rgba(0,0,0,0.2)';
                            let borderCol = 'var(--color-card-border)';

                            if (isAnswered) {
                                if (isCorrect) {
                                    bg = 'rgba(51, 187, 255, 0.2)'; // Primary blue tint
                                    borderCol = 'var(--color-primary-blue)';
                                } else if (isSelected && !isCorrect) {
                                    bg = 'rgba(255, 51, 102, 0.2)'; // Primary red tint
                                    borderCol = 'var(--color-primary-red)';
                                }
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(idx)}
                                    style={{
                                        padding: '20px',
                                        borderRadius: '16px',
                                        background: bg,
                                        border: `1px solid ${borderCol}`,
                                        color: 'white',
                                        fontSize: '1rem',
                                        textAlign: 'left',
                                        transition: 'all 0.2s ease',
                                        cursor: isAnswered ? 'default' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px'
                                    }}
                                    disabled={isAnswered}
                                >
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        opacity: 0.8, fontSize: '0.9rem', fontWeight: 'bold'
                                    }}>
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    {opt}
                                </button>
                            );
                        })}
                    </div>

                    {isAnswered && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={nextQuestion} className="btn-primary" style={{ padding: '12px 32px' }}>
                                {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>
        </main>
    );
}
