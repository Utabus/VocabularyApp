
import React from 'react';
import type { Tab, Language } from '../types';

interface TabsProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
    language: Language;
}

const getTabConfig = (language: Language) => [
    { id: 'list' as Tab, label: 'Danh sách từ' },
    { id: 'flashcard' as Tab, label: 'Flashcard' },
    { id: 'quiz' as Tab, label: 'Quiz (Định nghĩa)' },
    { id: 'matching' as Tab, label: 'Nối từ' },
    { id: 'pronunciation' as Tab, label: 'Tập phát âm' },
    { id: 'sentenceQuiz' as Tab, label: 'Điền câu' },
    { id: 'exampleSentences' as Tab, label: 'Tạo câu ví dụ'},
    { id: 'speakingPractice' as Tab, label: 'Luyện nói' },
    { id: 'speakingSuggestions' as Tab, label: 'Gợi ý luyện nói'},
    { id: 'podcast' as Tab, label: 'Podcast' },
    { id: 'ieltsPart1' as Tab, label: language === 'Chinese' ? 'HSK Speaking 1' : 'IELTS Part 1' },
    { id: 'ieltsPart2' as Tab, label: language === 'Chinese' ? 'HSK Speaking 2' : 'IELTS Part 2' },
];

const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange, language }) => {
    const tabs = getTabConfig(language);
    return (
        <div className="mb-6 border-b border-gray-700 overflow-x-auto">
            <nav className="flex -mb-px" aria-label="Tabs">
                {tabs.map(({ id, label }) => (
                    <button
                        key={id}
                        onClick={() => onTabChange(id)}
                        className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm md:text-base transition-colors duration-200 ${
                            activeTab === id 
                            ? (language === 'Chinese' ? 'bg-red-900/20 border-red-600 text-red-400' : 'bg-indigo-900/20 border-indigo-600 text-indigo-400') 
                            : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default Tabs;
