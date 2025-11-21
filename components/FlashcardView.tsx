
import React, { useState, useEffect } from 'react';
import type { VocabularyItem, Language } from '../types';
import { speakBrowser } from '../services/audioService';

interface FlashcardViewProps {
    vocabularyList: VocabularyItem[];
    language: Language;
}

const FlashcardView: React.FC<FlashcardViewProps> = ({ vocabularyList, language }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const currentItem = vocabularyList[currentIndex];

    useEffect(() => {
        setIsFlipped(false);
    }, [currentIndex]);
    
    useEffect(() => {
        setCurrentIndex(0);
        setIsFlipped(false);
    }, [vocabularyList]);

    useEffect(() => {
        if (!isFlipped && currentItem) {
            speakBrowser(currentItem.word, language);
        }
    }, [isFlipped, currentItem, language]);


    if (vocabularyList.length === 0) {
        return <p className="text-center text-gray-400">Không có từ vựng để hiển thị.</p>;
    }

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % vocabularyList.length);
    };

    return (
        <>
            <div className="mx-auto max-w-lg h-64 mb-6">
                <div id="flashcard" className={`flashcard w-full h-full cursor-pointer ${isFlipped ? 'is-flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
                    <div className="flashcard-inner">
                        <div className="flashcard-front">
                            <h2 className={`text-4xl font-bold text-center ${language === 'Chinese' ? 'text-5xl' : ''}`}>{currentItem.word}</h2>
                            {language === 'Chinese' && <p className="text-gray-300 mt-2 text-xl">{currentItem.ipa}</p>}
                        </div>
                        <div className="flashcard-back">
                             <p className="text-xl font-semibold text-center">{currentItem.meaning}</p>
                            <p className="mt-4 text-center italic text-gray-300">"{currentItem.example}"</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-center">
                <button onClick={handleNext} className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-700 transition">
                    Tiếp theo
                </button>
            </div>
        </>
    );
};

export default FlashcardView;
