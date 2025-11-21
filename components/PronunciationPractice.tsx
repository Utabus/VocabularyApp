
import React, { useState, useEffect, useRef } from 'react';
import type { VocabularyItem } from '../types';
import { speakBrowser } from '../services/audioService';

const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

interface PronunciationPracticeProps {
    vocabularyList: VocabularyItem[];
}

const PronunciationPractice: React.FC<PronunciationPracticeProps> = ({ vocabularyList }) => {
    const [words, setWords] = useState<VocabularyItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [inputValue, setInputValue] = useState('');
    const [feedback, setFeedback] = useState('');
    const [feedbackColor, setFeedbackColor] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const setupGame = () => {
        const numWords = Math.min(10, vocabularyList.length);
        const gameWords = shuffleArray(vocabularyList).slice(0, numWords);
        setWords(gameWords);
        setCurrentIndex(0);
        setScore(0);
        setInputValue('');
        setFeedback('');
        setIsChecking(false);
        setIsFinished(false);
        inputRef.current?.focus();
    };
    
    useEffect(setupGame, [vocabularyList]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isChecking && !isFinished) {
            checkAnswer();
        }
    };

    const checkAnswer = () => {
        setIsChecking(true);
        const currentWord = words[currentIndex];
        const isCorrect = inputValue.trim().toLowerCase() === currentWord.word.toLowerCase();

        if (isCorrect) {
            setScore(prev => prev + 1);
            setFeedback('Chính xác!');
            setFeedbackColor('text-green-400');
        } else {
            setFeedback(`Sai rồi! Đáp án đúng là: "${currentWord.word}"`);
            setFeedbackColor('text-red-400');
        }

        speakBrowser(currentWord.word);

        setTimeout(() => {
            if (currentIndex + 1 < words.length) {
                setCurrentIndex(prev => prev + 1);
                setInputValue('');
                setFeedback('');
                setIsChecking(false);
                inputRef.current?.focus();
            } else {
                setIsFinished(true);
            }
        }, isCorrect ? 1200 : 2000);
    };

    if (isFinished) {
        return (
            <div className="text-center">
                <h3 className="text-2xl font-bold text-indigo-400 mb-2">Hoàn thành!</h3>
                <p className="text-lg mb-4">Điểm của bạn: {score} / {words.length}</p>
                <button onClick={setupGame} className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-indigo-700 transition">
                    Luyện tập lại
                </button>
            </div>
        );
    }

    const currentWord = words[currentIndex];

    return (
        <div className="text-center max-w-2xl mx-auto">
            {currentWord ? (
                <>
                    <div className="mb-2 text-sm text-gray-400">Từ {currentIndex + 1} / {words.length}</div>
                    <p className="text-gray-400 mb-2">Nhập từ tiếng Anh cho nghĩa sau:</p>
                    <h3 className="text-2xl font-semibold mb-4 text-indigo-300">{currentWord.meaning}</h3>
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isChecking}
                        className="w-full max-w-md p-3 border rounded-md shadow-sm text-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-700 border-gray-600 text-gray-50 disabled:bg-gray-600"
                        placeholder="Gõ từ tiếng Anh..."
                    />
                    <p className={`mt-4 font-medium h-6 ${feedbackColor}`}>{feedback}</p>
                </>
            ) : (
                <p className="text-gray-400">Không có đủ từ để bắt đầu luyện tập.</p>
            )}
        </div>
    );
};

export default PronunciationPractice;
