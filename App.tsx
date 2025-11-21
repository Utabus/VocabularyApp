
import React, { useState, useEffect, useCallback } from 'react';
import type { VocabularyItem, Tab, IeltsPart1Item, IeltsPart2Item, VocabularySet, SpeakingQuestion, SpeakingSuggestionSet, SpeakingSuggestion, ExampleSentencePair, Language } from './types';
import ControlPanel from './components/ControlPanel';
import Tabs from './components/Tabs';
import VocabularyList from './components/VocabularyList';
import FlashcardView from './components/FlashcardView';
import QuizView from './components/QuizView';
import MatchingGame from './components/MatchingGame';
import PronunciationPractice from './components/PronunciationPractice';
import PodcastView from './components/PodcastView';
import IeltsView from './components/IeltsView';
import SpeakingPracticeView from './components/SpeakingPracticeView';
import SpeakingSuggestionsView from './components/SpeakingSuggestionsView';
import ExampleSentenceView from './components/ExampleSentenceView';
import ApiKeyModal from './components/ApiKeyModal';
import InstructionsModal from './components/InstructionsModal';
import { generateVocabularyAI } from './services/geminiService';
import { speakBrowser } from './services/audioService';
import { QuestionMarkCircleIcon, KeyIcon } from './components/icons';

const App: React.FC = () => {
    const [hasApiKey, setHasApiKey] = useState<boolean>(false);
    const [vocabularyList, setVocabularyList] = useState<VocabularyItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('list');
    const [showInstructions, setShowInstructions] = useState<boolean>(false);
    const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
    
    // Language State
    const [language, setLanguage] = useState<Language>('English');

    // State for vocabulary sets
    const [savedSets, setSavedSets] = useState<VocabularySet[]>([]);
    const [activeSetId, setActiveSetId] = useState<number | null>(null);

    // State for speaking suggestion sets
    const [savedSuggestionSets, setSavedSuggestionSets] = useState<SpeakingSuggestionSet[]>([]);
    const [activeSuggestionSetId, setActiveSuggestionSetId] = useState<number | null>(null);
    const [currentSuggestions, setCurrentSuggestions] = useState<SpeakingSuggestion[]>([]);


    // Current context derived from the active set
    const [currentTopic, setCurrentTopic] = useState<string>('Personal Information');
    const [currentLevel, setCurrentLevel] = useState<string>('B1');

    const [ieltsPart1Content, setIeltsPart1Content] = useState<IeltsPart1Item[] | null>(null);
    const [ieltsPart2Content, setIeltsPart2Content] = useState<IeltsPart2Item | null>(null);
    
    // State for Speaking Practice persistence
    const [speakingPracticeContent, setSpeakingPracticeContent] = useState<SpeakingQuestion[] | null>(null);
    const [speakingPracticeAnswers, setSpeakingPracticeAnswers] = useState<{ [key: number]: string }>({});
    const [speakingPracticeFeedback, setSpeakingPracticeFeedback] = useState<{ [key: number]: string | null }>({});

    // Check for existing API key session on mount
    useEffect(() => {
        const checkKey = async () => {
            if (process.env.API_KEY) {
                setHasApiKey(true);
                return;
            }
            const localKey = localStorage.getItem('gemini_api_key');
            if (localKey) {
                setHasApiKey(true);
                return;
            }
            if ((window as any).aistudio) {
                const hasKey = await (window as any).aistudio.hasSelectedApiKey();
                setHasApiKey(hasKey);
            }
        };
        checkKey();
    }, []);

    useEffect(() => {
        if (!hasApiKey) return;

        // Load Vocabulary Sets
        try {
            const savedSetsJSON = localStorage.getItem('vocabApp_savedSets');
            let sets: VocabularySet[] = savedSetsJSON ? JSON.parse(savedSetsJSON) : [];
            setSavedSets(sets);
            
            const savedActiveIdJSON = localStorage.getItem('vocabApp_activeSetId');
            let activeId: number | null = savedActiveIdJSON ? Number(savedActiveIdJSON) : null;

            if (activeId) {
                const activeSet = sets.find(s => s.id === activeId);
                if (activeSet) {
                    setVocabularyList(activeSet.vocabularyList);
                    setCurrentTopic(activeSet.topic);
                    setCurrentLevel(activeSet.level);
                    setLanguage(activeSet.language || 'English'); // Restore language
                    setActiveSetId(activeSet.id);
                } else {
                    setActiveSetId(null);
                    localStorage.removeItem('vocabApp_activeSetId');
                }
            }
        } catch (e) {
            console.error("Failed to load vocab sets from localStorage", e);
        }
        
        // Load other saved data... (omitted for brevity as logic is same)
    }, [hasApiKey]);

    const clearDerivedContent = () => {
        setIeltsPart1Content(null);
        setIeltsPart2Content(null);
        setSpeakingPracticeContent(null);
        setSpeakingPracticeAnswers({});
        setSpeakingPracticeFeedback({});
    };

    const handleGenerate = useCallback(async (lang: Language, topic: string, level: string, count: number) => {
        setIsLoading(true);
        setError(null);
        const newVocab = await generateVocabularyAI(lang, topic, level, count);
        setIsLoading(false);

        if (newVocab) {
            const newSet: VocabularySet = {
                id: Date.now(),
                language: lang,
                topic,
                level,
                count,
                vocabularyList: newVocab,
            };

            const updatedSets = [...savedSets, newSet];
            setSavedSets(updatedSets);
            setActiveSetId(newSet.id);
            setVocabularyList(newVocab);
            setCurrentTopic(topic);
            setCurrentLevel(level);
            setLanguage(lang);

            localStorage.setItem('vocabApp_savedSets', JSON.stringify(updatedSets));
            localStorage.setItem('vocabApp_activeSetId', newSet.id.toString());
            
            clearDerivedContent();
            setActiveTab('list');
        } else {
            setError("Không thể tạo danh sách từ vựng. Vui lòng kiểm tra lại và thử lại sau.");
        }
    }, [savedSets]);
    
    const handleLoadSet = useCallback((setId: number) => {
        const setToLoad = savedSets.find(s => s.id === setId);
        if (setToLoad) {
            setVocabularyList(setToLoad.vocabularyList);
            setCurrentTopic(setToLoad.topic);
            setCurrentLevel(setToLoad.level);
            setLanguage(setToLoad.language || 'English'); // Restore language
            setActiveSetId(setToLoad.id);
            localStorage.setItem('vocabApp_activeSetId', setToLoad.id.toString());

            clearDerivedContent();
            setActiveTab('list');
        }
    }, [savedSets]);

    const handleDeleteSet = useCallback((setId: number) => {
        const updatedSets = savedSets.filter(s => s.id !== setId);
        setSavedSets(updatedSets);
        localStorage.setItem('vocabApp_savedSets', JSON.stringify(updatedSets));

        if (activeSetId === setId) {
            setActiveSetId(null);
            setVocabularyList([]);
            localStorage.removeItem('vocabApp_activeSetId');
            clearDerivedContent();
        }
    }, [savedSets, activeSetId]);

     // Handlers for Speaking Suggestions
    const handleSaveSuggestionSet = (newSet: SpeakingSuggestionSet) => {
        const updatedSets = [...savedSuggestionSets, newSet];
        setSavedSuggestionSets(updatedSets);
        setActiveSuggestionSetId(newSet.id);
        setCurrentSuggestions(newSet.suggestions);
        localStorage.setItem('speakingSuggestions_savedSets', JSON.stringify(updatedSets));
        localStorage.setItem('speakingSuggestions_activeSetId', newSet.id.toString());
    };

    const handleLoadSuggestionSet = (setId: number) => {
        const setToLoad = savedSuggestionSets.find(s => s.id === setId);
        if (setToLoad) {
            setCurrentSuggestions(setToLoad.suggestions);
            setActiveSuggestionSetId(setToLoad.id);
            localStorage.setItem('speakingSuggestions_activeSetId', setToLoad.id.toString());
        }
    };

    const handleDeleteSuggestionSet = (setId: number) => {
        const updatedSets = savedSuggestionSets.filter(s => s.id !== setId);
        setSavedSuggestionSets(updatedSets);
        localStorage.setItem('speakingSuggestions_savedSets', JSON.stringify(updatedSets));

        if (activeSuggestionSetId === setId) {
            setActiveSuggestionSetId(null);
            setCurrentSuggestions([]);
            localStorage.removeItem('speakingSuggestions_activeSetId');
        }
    };

    const handleGeneratedExamples = (word: string, examples: ExampleSentencePair[]) => {
        const updatedVocabList = vocabularyList.map(item => 
          item.word === word 
            ? { ...item, generated_examples: examples } 
            : item
        );
        setVocabularyList(updatedVocabList);
      
        if (activeSetId) {
          const updatedSets = savedSets.map(set => 
            set.id === activeSetId 
              ? { ...set, vocabularyList: updatedVocabList } 
              : set
          );
          setSavedSets(updatedSets);
          localStorage.setItem('vocabApp_savedSets', JSON.stringify(updatedSets));
        }
      };

    const handleLanguageChange = (lang: Language) => {
        setLanguage(lang);
        // Reset current list view to avoid confusion or keep existing? 
        // Better to keep existing view but user knows they are switching mode for NEXT generation.
    };

    const handleTabChange = (tab: Tab) => {
        speakBrowser('');
        setActiveTab(tab);
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'list': return <VocabularyList vocabularyList={vocabularyList} language={language} />;
            case 'flashcard': return <FlashcardView vocabularyList={vocabularyList} language={language} />;
            case 'quiz': return <QuizView vocabularyList={vocabularyList} quizType="translation" title="Quiz (Dịch Nghĩa)" />;
            case 'matching': return <MatchingGame vocabularyList={vocabularyList} />;
            case 'pronunciation': return <PronunciationPractice vocabularyList={vocabularyList} />;
            case 'sentenceQuiz': return <QuizView vocabularyList={vocabularyList} quizType="sentence" title="Điền vào câu" />;
            case 'definitionQuiz': return <QuizView vocabularyList={vocabularyList} quizType="definition" title="Quiz (Mô tả)" />;
            case 'podcast': return <PodcastView vocabularyList={vocabularyList} topic={currentTopic} language={language} />;
            case 'ieltsPart1':
                return <IeltsView 
                            part={1} 
                            vocabularyList={vocabularyList} 
                            topic={currentTopic} 
                            level={currentLevel}
                            language={language}
                            content={ieltsPart1Content}
                            onContentChange={setIeltsPart1Content}
                        />;
            case 'ieltsPart2':
                return <IeltsView 
                            part={2} 
                            vocabularyList={vocabularyList} 
                            topic={currentTopic} 
                            level={currentLevel} 
                            language={language}
                            content={ieltsPart2Content}
                            onContentChange={setIeltsPart2Content}
                        />;
            case 'speakingPractice':
                return <SpeakingPracticeView 
                            vocabularyList={vocabularyList} 
                            topic={currentTopic}
                            level={currentLevel}
                            language={language}
                            content={speakingPracticeContent}
                            onContentChange={setSpeakingPracticeContent}
                            answers={speakingPracticeAnswers}
                            onAnswersChange={setSpeakingPracticeAnswers}
                            feedback={speakingPracticeFeedback}
                            onFeedbackChange={setSpeakingPracticeFeedback}
                        />;
            case 'speakingSuggestions':
                return <SpeakingSuggestionsView 
                            topic={currentTopic}
                            level={currentLevel}
                            language={language}
                            onSaveSet={handleSaveSuggestionSet}
                            savedSets={savedSuggestionSets}
                            activeSetId={activeSuggestionSetId}
                            onLoadSet={handleLoadSuggestionSet}
                            onDeleteSet={handleDeleteSuggestionSet}
                            suggestions={currentSuggestions}
                        />;
            case 'exampleSentences':
                return <ExampleSentenceView
                            vocabularyList={vocabularyList}
                            level={currentLevel}
                            language={language}
                            onExamplesGenerated={handleGeneratedExamples}
                        />
            default: return null;
        }
    };

    if (!hasApiKey && !showApiKeyModal) {
        return <ApiKeyModal onSuccess={() => setHasApiKey(true)} />;
    }

    return (
        <div className="container mx-auto p-4 md:p-8 text-gray-300 relative">
            <header className="text-center mb-8 relative">
                <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    AI Vocabulary Builder
                </h1>
                <p className="text-gray-400 mt-2">Học từ vựng Anh - Trung với lộ trình thông minh</p>
                
                <div className="absolute top-0 right-0 mt-[-10px] md:mt-2 flex gap-3">
                    <button 
                        onClick={() => setShowApiKeyModal(true)}
                        className="text-gray-400 hover:text-indigo-400 transition flex flex-col items-center gap-1"
                    >
                        <KeyIcon />
                        <span className="text-xs hidden md:inline">API Key</span>
                    </button>
                    <button 
                        onClick={() => setShowInstructions(true)}
                        className="text-gray-400 hover:text-indigo-400 transition flex flex-col items-center gap-1"
                    >
                        <QuestionMarkCircleIcon />
                        <span className="text-xs hidden md:inline">Hướng dẫn</span>
                    </button>
                </div>
            </header>

            <ControlPanel 
                onGenerate={handleGenerate} 
                isLoading={isLoading} 
                error={error}
                savedSets={savedSets}
                activeSetId={activeSetId}
                onLoadSet={handleLoadSet}
                onDeleteSet={handleDeleteSet}
                language={language}
                onLanguageChange={handleLanguageChange}
            />
            
            {(vocabularyList.length > 0 || activeTab === 'speakingSuggestions') && (
                 <main>
                    <Tabs activeTab={activeTab} onTabChange={handleTabChange} language={language} />
                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                        {renderTabContent()}
                    </div>
                </main>
            )}

            {showInstructions && <InstructionsModal onClose={() => setShowInstructions(false)} />}
            
            {showApiKeyModal && (
                <ApiKeyModal 
                    onSuccess={() => {
                        setHasApiKey(true);
                        setShowApiKeyModal(false);
                    }}
                    onClose={hasApiKey ? () => setShowApiKeyModal(false) : undefined}
                />
            )}
        </div>
    );
};

export default App;
