import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { VocabularyItem, QuizQuestion } from '../types';
import { speakBrowser } from '../services/audioService';

type QuizType = 'translation' | 'sentence' | 'definition';

interface SubMode {
  key: string;
  label: string;
}

interface QuizViewProps {
    vocabularyList: VocabularyItem[];
    quizType: QuizType;
    title: string;
}

const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

const QuizView: React.FC<QuizViewProps> = ({ vocabularyList, quizType, title }) => {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [feedbackColor, setFeedbackColor] = useState('');
    const [gameState, setGameState] = useState<'setup' | 'playing' | 'result'>('setup');
    const [questionCount, setQuestionCount] = useState(10);
    const [answeredOption, setAnsweredOption] = useState<VocabularyItem | null>(null);
    
    const subModes = useMemo((): SubMode[] => {
        if (quizType === 'translation') return [
            { key: 'en-vi', label: 'Anh → Việt' },
            { key: 'vi-en', label: 'Việt → Anh' }
        ];
        if (quizType === 'sentence') return [
            { key: 'en-blank', label: 'Câu Tiếng Anh' },
            { key: 'vi-prompt', label: 'Câu Tiếng Việt' }
        ];
        if (quizType === 'definition') return [
            { key: 'en-def', label: 'Mô tả Tiếng Anh' },
            { key: 'vi-def', label: 'Mô tả Tiếng Việt' }
        ];
        return [];
    }, [quizType]);

    const [activeSubMode, setActiveSubMode] = useState(subModes.length > 0 ? subModes[0].key : '');

    const generateQuestions = useCallback(() => {
        const validVocab = vocabularyList.filter(item => {
            switch (activeSubMode) {
                case 'en-blank': return item.example && item.example.trim() !== "";
                case 'vi-prompt': return item.vi_example && item.vi_example.trim() !== "";
                case 'en-def': return item.en_definition && item.en_definition.trim() !== "";
                case 'vi-def': return item.vi_definition && item.vi_definition.trim() !== "";
                default: return true;
            }
        });

        if (validVocab.length < 4) {
            return [];
        }

        const shuffledVocab = shuffleArray(validVocab).slice(0, questionCount);
        
        return shuffledVocab.map((correctAnswer: VocabularyItem) => {
            const otherWords = validVocab.filter(item => item.word !== correctAnswer.word);
            const wrongAnswers = shuffleArray(otherWords).slice(0, 3);
            const options = shuffleArray([correctAnswer, ...wrongAnswers]);
            return { correctAnswer, options };
        });
    }, [vocabularyList, activeSubMode, questionCount]);

    useEffect(() => {
        setGameState('setup');
        if (subModes.length > 0) {
            setActiveSubMode(subModes[0].key);
        }
    }, [vocabularyList, quizType, subModes]);

    const startQuiz = () => {
        const newQuestions = generateQuestions();
        if (newQuestions.length === 0) {
            alert("Không đủ từ vựng để tạo bài quiz với các tùy chọn đã chọn.");
            return;
        }
        setQuestions(newQuestions);
        setCurrentIndex(0);
        setScore(0);
        setFeedback('');
        setGameState('playing');
    };

    const handleAnswer = (selectedOption: VocabularyItem) => {
        if (answeredOption) return;

        setAnsweredOption(selectedOption);
        const currentQuestion = questions[currentIndex];
        const isCorrect = selectedOption.word === currentQuestion.correctAnswer.word;

        if (isCorrect) {
            setScore(prev => prev + 1);
            setFeedback('Chính xác!');
            setFeedbackColor('text-green-400');
            speakBrowser(selectedOption.word);
        } else {
            setFeedback(`Sai rồi! Đáp án đúng là: "${currentQuestion.correctAnswer.word}"`);
            setFeedbackColor('text-red-400');
        }
        
        setTimeout(() => {
            if (currentIndex + 1 < questions.length) {
                setCurrentIndex(prev => prev + 1);
                setFeedback('');
                setAnsweredOption(null);
            } else {
                setGameState('result');
            }
        }, isCorrect ? 1200 : 2500);
    };
    
    const getQuestionText = (item: VocabularyItem) => {
        switch (activeSubMode) {
            case 'en-vi': return item.word;
            case 'vi-en': return item.meaning;
            case 'en-blank': 
                const wordToBlank = item.word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                return item.example.replace(new RegExp(wordToBlank, 'i'), '_______');
            case 'vi-prompt': return item.vi_example;
            case 'en-def': return item.en_definition;
            case 'vi-def': return item.vi_definition;
            default: return '';
        }
    }

    const getOptionText = (item: VocabularyItem) => {
        return (activeSubMode === 'en-vi') ? item.meaning : item.word;
    };
    
    const currentQuestion = useMemo(() => {
        return gameState === 'playing' && currentIndex < questions.length ? questions[currentIndex] : null;
    }, [gameState, currentIndex, questions]);

    const getButtonClass = (option: VocabularyItem) => {
        if (!answeredOption) {
            return 'hover:bg-gray-700';
        }
        const isCorrectAnswer = option.word === currentQuestion!.correctAnswer.word;
        const isSelectedAnswer = option.word === answeredOption.word;

        if (isCorrectAnswer) {
            return 'bg-green-500/30 border-green-500';
        }
        if (isSelectedAnswer && !isCorrectAnswer) {
            return 'bg-red-500/30 border-red-500';
        }
        return 'opacity-50'; // Fade out other non-correct options
    };


    if (gameState === 'setup') {
        return (
            <div className="text-center max-w-md mx-auto">
                <h3 className="text-2xl font-bold text-indigo-400 mb-4">{title}</h3>
                
                <div className="flex items-center justify-center gap-4 mb-4">
                    <label className="text-sm font-medium text-gray-300">Chế độ:</label>
                    <div className="flex gap-2 rounded-md p-1 bg-gray-900">
                         {subModes.map(sm => (
                            <button 
                                key={sm.key}
                                onClick={() => setActiveSubMode(sm.key)}
                                className={`px-3 py-1 text-sm rounded-md transition ${activeSubMode === sm.key ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                {sm.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-center gap-4 mb-6">
                    <label htmlFor="quiz-question-count" className="text-sm font-medium text-gray-300">Số câu hỏi:</label>
                    <select
                        id="quiz-question-count"
                        value={questionCount}
                        onChange={(e) => setQuestionCount(Number(e.target.value))}
                        className="p-2 border rounded-md shadow-sm bg-gray-700 border-gray-600 text-gray-50"
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="20">20</option>
                    </select>
                </div>
                <button onClick={startQuiz} className="bg-green-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-green-700 transition">
                    Bắt đầu
                </button>
            </div>
        );
    }

    if (gameState === 'result') {
        return (
            <div className="text-center">
                <h3 className="text-2xl font-bold text-indigo-400 mb-2">Hoàn thành!</h3>
                <p className="text-lg mb-4">Điểm của bạn: {score} / {questions.length}</p>
                <button onClick={() => setGameState('setup')} className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-indigo-700 transition">
                    Chơi lại
                </button>
            </div>
        );
    }

    return (
        <div className="text-center max-w-2xl mx-auto">
            {currentQuestion && (
                <>
                    <div className="mb-2 text-sm text-gray-400">Câu {currentIndex + 1} / {questions.length}</div>
                    <h3 className="text-2xl font-semibold mb-6 text-indigo-300 leading-relaxed">
                        {getQuestionText(currentQuestion.correctAnswer)}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={`${currentIndex}-${option.word}`} // Use a key that changes with the question
                                onClick={() => handleAnswer(option)}
                                disabled={!!answeredOption}
                                className={`w-full p-4 border border-gray-600 rounded-lg text-left transition duration-300 disabled:cursor-not-allowed ${getButtonClass(option)}`}
                            >
                                {getOptionText(option)}
                            </button>
                        ))}
                    </div>
                    <p className={`mt-4 font-medium h-6 ${feedbackColor}`}>{feedback}</p>
                </>
            )}
        </div>
    );
};

export default QuizView;