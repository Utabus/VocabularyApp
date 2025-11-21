
import React, { useState, useEffect } from 'react';
import { TOPICS, LEVELS_ENGLISH, LEVELS_CHINESE, COUNTS } from '../constants';
import { VocabularySet, Language } from '../types';

interface ControlPanelProps {
    onGenerate: (language: Language, topic: string, level: string, count: number) => void;
    isLoading: boolean;
    error: string | null;
    savedSets: VocabularySet[];
    activeSetId: number | null;
    onLoadSet: (id: number) => void;
    onDeleteSet: (id: number) => void;
    language: Language;
    onLanguageChange: (lang: Language) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
    onGenerate, isLoading, error, savedSets, activeSetId, onLoadSet, onDeleteSet, language, onLanguageChange 
}) => {
    const [topic, setTopic] = useState<string>(TOPICS[0].options[0]);
    const [level, setLevel] = useState<string>('B1');
    const [count, setCount] = useState<number>(20);

    const currentLevels = language === 'Chinese' ? LEVELS_CHINESE : LEVELS_ENGLISH;

    // Reset level when language changes
    useEffect(() => {
        setLevel(language === 'Chinese' ? 'HSK 3' : 'B1');
    }, [language]);

    const handleSubmit = () => {
        onGenerate(language, topic, level, count);
    };

    // Filter saved sets by current language
    const filteredSets = savedSets.filter(s => (s.language || 'English') === language);

    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
            
            {/* Language Switcher */}
            <div className="flex justify-center mb-6">
                <div className="bg-gray-700 p-1 rounded-lg inline-flex">
                    <button 
                        onClick={() => onLanguageChange('English')}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition ${language === 'English' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        🇬🇧 English (IELTS)
                    </button>
                    <button 
                        onClick={() => onLanguageChange('Chinese')}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition ${language === 'Chinese' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        🇨🇳 Chinese (HSK)
                    </button>
                </div>
            </div>

             {filteredSets.length > 0 && (
                <div className="mb-6 pb-6 border-b border-gray-700">
                    <label htmlFor="saved-set-select" className="block text-sm font-medium text-gray-300 mb-1">
                        Ôn lại bộ từ ({language})
                    </label>
                    <div className="flex gap-2 items-center">
                        <select
                            id="saved-set-select"
                            value={activeSetId ?? ''}
                            onChange={(e) => onLoadSet(Number(e.target.value))}
                            className="flex-grow w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-700 border-gray-600 text-gray-50"
                        >
                             <option value="" disabled>-- Chọn một bộ từ --</option>
                            {filteredSets.map(set => (
                                <option key={set.id} value={set.id}>
                                    {new Date(set.id).toLocaleDateString('vi-VN')} - {set.topic} ({set.count} từ) - {set.level}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => {
                                if (activeSetId && window.confirm('Bạn có chắc muốn xoá bộ từ vựng này không?')) {
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label htmlFor="topic-select" className="block text-sm font-medium text-gray-300 mb-1">Tạo bộ từ mới</label>
                    <select
                        id="topic-select"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-700 border-gray-600 text-gray-50"
                    >
                        {TOPICS.map(group => (
                            <optgroup label={group.label} key={group.label}>
                                {group.options.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="level-select" className="block text-sm font-medium text-gray-300 mb-1">
                        {language === 'Chinese' ? 'Cấp độ (HSK Roadmap)' : 'Trình độ (CEFR)'}
                    </label>
                    <select
                        id="level-select"
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-700 border-gray-600 text-gray-50"
                    >
                        {currentLevels.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="count-select" className="block text-sm font-medium text-gray-300 mb-1">Số lượng từ</label>
                    <select
                        id="count-select"
                        value={count}
                        onChange={(e) => setCount(Number(e.target.value))}
                        className="w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-700 border-gray-600 text-gray-50"
                    >
                        {COUNTS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={`w-full text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed ${language === 'Chinese' ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                    {isLoading ? 'Đang tạo...' : 'Tạo danh sách'}
                </button>
            </div>
            {isLoading && (
                <div className="text-center mt-4">
                    <p className="text-indigo-400">🧠 AI đang kết nối và tạo danh sách từ vựng...</p>
                </div>
            )}
            {error && (
                <div className="bg-red-900 text-red-100 p-3 rounded-md mt-4 text-center">
                    {error}
                </div>
            )}
        </div>
    );
};

export default ControlPanel;
