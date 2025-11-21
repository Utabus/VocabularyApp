
import React, { useState } from 'react';
import type { SpeakingSuggestion, SpeakingSuggestionSet, Language } from '../types';
import { generateSpeakingSuggestionsAI } from '../services/geminiService';
import { Spinner, LightbulbIcon } from './icons';

interface SpeakingSuggestionsViewProps {
    topic: string;
    level: string;
    language: Language;
    onSaveSet: (set: SpeakingSuggestionSet) => void;
    savedSets: SpeakingSuggestionSet[];
    activeSetId: number | null;
    onLoadSet: (id: number) => void;
    onDeleteSet: (id: number) => void;
    suggestions: SpeakingSuggestion[];
}

const SpeakingSuggestionsView: React.FC<SpeakingSuggestionsViewProps> = ({
    topic,
    level,
    language,
    onSaveSet,
    savedSets,
    activeSetId,
    onLoadSet,
    onDeleteSet,
    suggestions
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!topic || !topic.trim()) {
            setError("Chưa có chủ đề nào được chọn.");
            return;
        }
        setIsLoading(true);
        setError(null);

        const newSuggestions = await generateSpeakingSuggestionsAI(language, topic, level);
        setIsLoading(false);
        
        if (newSuggestions) {
            const newSet: SpeakingSuggestionSet = {
                id: Date.now(),
                topic,
                level,
                suggestions: newSuggestions,
            };
            onSaveSet(newSet);
        } else {
            setError("Không thể tạo gợi ý. Vui lòng thử lại sau.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-gray-900 p-6 rounded-xl shadow-lg mb-8">
                {savedSets.length > 0 && (
                    <div className="mb-6 pb-6 border-b border-gray-700">
                        <label htmlFor="saved-suggestion-set-select" className="block text-sm font-medium text-gray-300 mb-1">
                            Ôn lại bộ gợi ý đã tạo
                        </label>
                        <div className="flex gap-2 items-center">
                            <select
                                id="saved-suggestion-set-select"
                                value={activeSetId ?? ''}
                                onChange={(e) => onLoadSet(Number(e.target.value))}
                                className="flex-grow w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-700 border-gray-600 text-gray-50"
                            >
                                <option value="" disabled>-- Chọn một bộ gợi ý --</option>
                                {savedSets.map(set => (
                                    <option key={set.id} value={set.id}>
                                        {new Date(set.id).toLocaleDateString('vi-VN')} - {set.topic}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={() => {
                                    if (activeSetId && window.confirm('Bạn có chắc muốn xoá bộ gợi ý này không?')) {
                                        onDeleteSet(activeSetId);
                                    }
                                }}
                                disabled={!activeSetId || isLoading}
                                className="bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 transition disabled:bg-red-400 disabled:cursor-not-allowed"
                            >
                               Xoá
                            </button>
                        </div>
                    </div>
                )}
                <div className="text-center">
                     <p className="text-sm font-medium text-gray-300 mb-2">
                        Tạo gợi ý luyện nói cho chủ đề hiện tại ({language})
                    </p>
                    <p className="text-xl font-semibold text-indigo-400 mb-4">{topic || 'Chưa chọn chủ đề'}</p>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !topic}
                        className="w-full max-w-xs mx-auto bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 transition disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Spinner /> : <LightbulbIcon />}
                        {isLoading ? 'Đang tạo...' : 'Tạo Gợi ý'}
                    </button>
                </div>
                 {error && (
                    <div className="bg-red-900 text-red-100 p-3 rounded-md mt-4 text-center">
                        {error}
                    </div>
                )}
            </div>

            {suggestions.length > 0 ? (
                <div className="space-y-6">
                    {suggestions.map((suggestion, index) => (
                        <div key={index} className="p-4 border border-gray-700 rounded-lg bg-gray-900">
                            <h3 className="text-lg font-semibold text-teal-400">{suggestion.category}</h3>
                            <ul className="mt-3 space-y-3 text-gray-300">
                                {suggestion.phrases.map((phrasePair, pIndex) => (
                                    <li key={pIndex}>
                                        <p className="font-medium">{phrasePair.en}</p>
                                        <p className="text-sm text-gray-400 italic pl-4">⤷ {phrasePair.vi}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            ) : (
                 !isLoading && <p className="text-center text-gray-400">Chưa có gợi ý nào. Hãy tạo một bộ gợi ý mới!</p>
            )}
        </div>
    );
};

export default SpeakingSuggestionsView;
