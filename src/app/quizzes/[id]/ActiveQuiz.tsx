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
            <main className="page-container quiz-finished-container">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card quiz-finished-card">
                    <CheckCircle size={64} color="var(--color-primary-blue)" weight="fill" className="mb-24" />
                    <h1 className="heading-xl quiz-finished-heading">Quiz Complete!</h1>
                    <p className="quiz-finished-score">
                        You scored {score} out of {questions.length}.
                    </p>
                    <div className="quiz-finished-actions">
                        <Link href={`/notes/${quiz.noteId}`} className="glass-card quiz-finished-link">Back to Note</Link>
                        <Link href="/quizzes" className="btn-primary">View All Quizzes</Link>
                    </div>
                </motion.div>
            </main>
        );
    }

    const getOptionClass = (idx: number) => {
        if (!isAnswered) return 'quiz-option-btn quiz-option-default';
        const isCorrect = String(idx) === currentQ.correctOptionIndex;
        const isSelected = selectedOption === idx;
        if (isCorrect) return 'quiz-option-btn quiz-option-correct';
        if (isSelected && !isCorrect) return 'quiz-option-btn quiz-option-wrong';
        return 'quiz-option-btn quiz-option-default';
    };

    return (
        <main className="page-container">
            <Link href="/quizzes" className="nav-link-back">
                <CaretLeft weight="bold" /> Leave Quiz
            </Link>

            <div className="quiz-progress-header">
                <h1 className="heading-xl text-2xl no-margin">{quiz.title}</h1>
                <div className="quiz-progress-badge">
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
                    className="glass-card quiz-question-card"
                >
                    <h2 className="quiz-question-text">
                        {currentQ.questionText}
                    </h2>

                    <div className="flex-col gap-16">
                        {currentQ.options.map((opt: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => handleSelect(idx)}
                                className={getOptionClass(idx)}
                                disabled={isAnswered}
                            >
                                <div className="quiz-option-letter">
                                    {String.fromCharCode(65 + idx)}
                                </div>
                                {opt}
                            </button>
                        ))}
                    </div>

                    {isAnswered && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="quiz-next-container">
                            <button onClick={nextQuestion} className="btn-primary quiz-next-btn">
                                {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>
        </main>
    );
}
