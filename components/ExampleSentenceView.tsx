
import React, { useState } from 'react';
import type { VocabularyItem, ExampleSentencePair, Language } from '../types';
import { generateExampleSentencesAI } from '../services/geminiService';
import { Spinner, PlusCircleIcon } from './icons';

interface ExampleSentenceViewProps {
    vocabularyList: VocabularyItem[];
    level: string;
    language: Language;
    onExamplesGenerated: (word: string, examples: ExampleSentencePair[]) => void;
}

const ExampleSentenceView: React.FC<ExampleSentenceViewProps> = ({ vocabularyList, level, language, onExamplesGenerated }) => {
    const [loadingStates, setLoadingStates] = useState<{ [word: string]: boolean }>({});

    const handleGenerate = async (word: string) => {
        setLoadingStates(prev => ({ ...prev, [word]: true }));
        
        const examples = await generateExampleSentencesAI(language, word, level);
        if (examples) {
            onExamplesGenerated(word, examples);
        } else {
            alert(`Không thể tạo câu ví dụ cho từ "${word}". Vui lòng thử lại.`);
        }

        setLoadingStates(prev => ({ ...prev, [word]: false }));
    };

    if (vocabularyList.length === 0) {
        return <p className="text-gray-400">Chưa có danh sách từ vựng nào. Hãy tạo một danh sách mới!</p>;
    }

    return (
        <div className="space-y-4">
            {vocabularyList.map((item, index) => (
                <div key={index} className="p-4 border border-gray-700 rounded-lg bg-gray-900">
                    <h3 className="text-lg font-semibold text-indigo-400">{item.word}</h3>
                    <p className="mt-1 text-gray-400 italic"><strong>Ví dụ gốc:</strong> {item.example}</p>

                    {item.generated_examples && item.generated_examples.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-800">
                            <h4 className="font-medium text-gray-300">Các ví dụ khác:</h4>
                            <ul className="mt-2 space-y-3 text-gray-300">
                                {item.generated_examples.map((ex, i) => (
                                    <li key={i}>
                                        <p>{ex.en}</p>
                                        <p className="text-sm text-gray-400 italic pl-4">⤷ {ex.vi}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button
                        onClick={() => handleGenerate(item.word)}
                        disabled={loadingStates[item.word]}
                        className="mt-3 bg-teal-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-teal-700 transition disabled:bg-teal-400 flex items-center gap-2"
                    >
                        {loadingStates[item.word] ? <Spinner /> : <PlusCircleIcon />}
                        {loadingStates[item.word] ? 'Đang tạo...' : 'Tạo 5 ví dụ mới'}
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ExampleSentenceView;
