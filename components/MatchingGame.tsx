
import React, { useState, useEffect } from 'react';
import type { VocabularyItem } from '../types';
import { speakBrowser } from '../services/audioService';

const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

interface MatchingGameProps {
    vocabularyList: VocabularyItem[];
}

const MatchingGame: React.FC<MatchingGameProps> = ({ vocabularyList }) => {
    const [gameState, setGameState] = useState<'setup' | 'playing' | 'result'>('setup');
    const [pairCount, setPairCount] = useState(10);
    const [pairs, setPairs] = useState<VocabularyItem[]>([]);
    const [englishWords, setEnglishWords] = useState<VocabularyItem[]>([]);
    const [vietnameseMeanings, setVietnameseMeanings] = useState<VocabularyItem[]>([]);
    const [selectedEnglish, setSelectedEnglish] = useState<VocabularyItem | null>(null);
    const [selectedVietnamese, setSelectedVietnamese] = useState<VocabularyItem | null>(null);
    const [correctMatches, setCorrectMatches] = useState<string[]>([]);
    const [incorrectPair, setIncorrectPair] = useState<[string, string] | null>(null);

    const startNewGame = () => {
        if (vocabularyList.length < pairCount) {
            alert("Không đủ từ vựng để tạo game với số cặp đã chọn.");
            return;
        }
        const gamePairs = shuffleArray(vocabularyList).slice(0, pairCount);
        setPairs(gamePairs);
        setEnglishWords(shuffleArray(gamePairs));
        setVietnameseMeanings(shuffleArray(gamePairs));
        setSelectedEnglish(null);
        setSelectedVietnamese(null);
        setCorrectMatches([]);
        setIncorrectPair(null);
        setGameState('playing');
    };
    
    useEffect(() => {
        setGameState('setup');
    }, [vocabularyList]);

    useEffect(() => {
        if (selectedEnglish && selectedVietnamese) {
            if (selectedEnglish.word === selectedVietnamese.word) {
                setCorrectMatches(prev => [...prev, selectedEnglish.word]);
                speakBrowser(selectedEnglish.word);
                setSelectedEnglish(null);
                setSelectedVietnamese(null);
            } else {
                setIncorrectPair([selectedEnglish.word, selectedVietnamese.meaning]);
                setTimeout(() => {
                    setIncorrectPair(null);
                    setSelectedEnglish(null);
                    setSelectedVietnamese(null);
                }, 800);
            }
        }
    }, [selectedEnglish, selectedVietnamese]);
    
    useEffect(() => {
        if(pairs.length > 0 && correctMatches.length === pairs.length) {
            setTimeout(() => setGameState('result'), 500);
        }
    }, [correctMatches, pairs]);

    const getButtonClass = (item: VocabularyItem, type: 'english' | 'vietnamese') => {
        const word = item.word;
        const meaning = item.meaning;
        if (correctMatches.includes(word)) return 'correct bg-green-600 border-green-500 text-green-50 cursor-not-allowed';
        if (type === 'english' && selectedEnglish?.word === word) return 'selected bg-blue-600 border-blue-500 text-white';
        if (type === 'vietnamese' && selectedVietnamese?.word === word) return 'selected bg-blue-600 border-blue-500 text-white';
        if (incorrectPair && (incorrectPair[0] === word || incorrectPair[1] === meaning)) return 'incorrect bg-red-600 border-red-500 text-white';
        return 'bg-gray-700 border-gray-600 hover:bg-gray-600';
    };

    if (gameState === 'setup') {
        return (
            <div className="text-center max-w-md mx-auto">
                <div className="flex items-center justify-center gap-4 mb-6">
                    <label htmlFor="matching-pair-count" className="text-sm font-medium text-gray-300">Số cặp:</label>
                    <select
                        id="matching-pair-count"
                        value={pairCount}
                        onChange={(e) => setPairCount(Number(e.target.value))}
                        className="p-2 border rounded-md shadow-sm bg-gray-700 border-gray-600 text-gray-50"
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="20">20</option>
                    </select>
                </div>
                <button onClick={startNewGame} className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-indigo-700 transition">
                    Bắt đầu
                </button>
            </div>
        );
    }

    if (gameState === 'result') {
        return (
            <div className="text-center">
                <h3 className="text-2xl font-bold text-green-400 mb-4">Tuyệt vời! Bạn đã hoàn thành.</h3>
                <button onClick={() => setGameState('setup')} className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-indigo-700 transition">
                    Chơi lại
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <p className="text-center text-gray-400 mb-4">Click vào một từ ở cột trái và nghĩa tương ứng ở cột phải để nối chúng.</p>
            <div className="grid grid-cols-2 gap-4 md:gap-8">
                <div className="space-y-3">
                    {englishWords.map(item => (
                        <button key={item.word}
                            onClick={() => !correctMatches.includes(item.word) && setSelectedEnglish(item)}
                            disabled={correctMatches.includes(item.word)}
                            className={`w-full p-3 border rounded-lg cursor-pointer transition duration-200 ${getButtonClass(item, 'english')}`}
                        >{item.word}</button>
                    ))}
                </div>
                <div className="space-y-3">
                    {vietnameseMeanings.map(item => (
                        <button key={item.word}
                            onClick={() => !correctMatches.includes(item.word) && setSelectedVietnamese(item)}
                            disabled={correctMatches.includes(item.word)}
                            className={`w-full p-3 border rounded-lg cursor-pointer transition duration-200 ${getButtonClass(item, 'vietnamese')}`}
                        >{item.meaning}</button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MatchingGame;
