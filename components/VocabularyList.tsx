
import React from 'react';
import type { VocabularyItem, Language } from '../types';
import { PlayIcon } from './icons';
import { speakBrowser } from '../services/audioService';

interface VocabularyListProps {
    vocabularyList: VocabularyItem[];
    language: Language;
}

const VocabularyList: React.FC<VocabularyListProps> = ({ vocabularyList, language }) => {
    if (vocabularyList.length === 0) {
        return <p className="text-gray-400">Chưa có danh sách từ vựng nào. Hãy tạo một danh sách mới!</p>;
    }

    return (
        <div className="space-y-4">
            {vocabularyList.map((item, index) => (
                <div key={index} className="p-4 border border-gray-700 rounded-lg bg-gray-900">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className={`text-lg font-bold ${language === 'Chinese' ? 'text-red-400 text-xl' : 'text-indigo-400'}`}>
                                {item.word}
                                <span className="text-sm text-gray-400 ml-2 font-normal">({item.pos})</span>
                            </h3>
                            <p className="text-sm text-gray-400">{item.ipa}</p>
                        </div>
                        <button
                            onClick={() => speakBrowser(item.word, language)}
                            className="text-blue-400 hover:text-blue-300"
                            aria-label={`Listen to ${item.word}`}
                        >
                            <PlayIcon />
                        </button>
                    </div>
                    <p className="mt-2"><strong className="font-medium text-gray-300">Nghĩa:</strong> {item.meaning}</p>
                    <div className="mt-2">
                        <p className="text-gray-300 italic">
                            <strong>Ví dụ:</strong> {item.example}
                             <button 
                                onClick={() => speakBrowser(item.example, language)}
                                className="ml-2 inline-block align-middle text-gray-500 hover:text-gray-300"
                             >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                             </button>
                        </p>
                        {item.vi_example_full && (
                             <p className="text-sm text-gray-400 italic pl-4">⤷ {item.vi_example_full}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default VocabularyList;
