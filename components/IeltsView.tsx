
import React, { useState, useEffect } from 'react';
import type { VocabularyItem, IeltsPart1Item, IeltsPart2Item, Language } from '../types';
import { generateIeltsPart1AI, generateIeltsPart2AI, evaluateIeltsSpeakingAI } from '../services/geminiService';
import { speakBrowser } from '../services/audioService';
import { PlayIcon, Spinner, PencilIcon } from './icons';

interface SpeakingPracticeState {
  textAnswer: string;
  isEvaluating: boolean;
  feedback: string | null;
}

const initialSpeakingState: SpeakingPracticeState = {
  textAnswer: '',
  isEvaluating: false,
  feedback: null,
};

type BaseProps = {
    vocabularyList: VocabularyItem[];
    topic: string;
    level: string;
    language: Language;
};

type Part1Props = BaseProps & {
    part: 1;
    content: IeltsPart1Item[] | null;
    onContentChange: (content: IeltsPart1Item[] | null) => void;
};

type Part2Props = BaseProps & {
    part: 2;
    content: IeltsPart2Item | null;
    onContentChange: (content: IeltsPart2Item | null) => void;
};

type IeltsViewProps = Part1Props | Part2Props;

// UI Configuration Strategy
const UI_CONFIG = {
    English: {
        part1Title: 'IELTS Speaking Part 1',
        part2Title: 'IELTS Speaking Part 2',
        description: 'Luyện tập trả lời câu hỏi theo chủ đề',
        voiceLabel: 'English',
    },
    Chinese: {
        part1Title: 'HSK Speaking Part 1',
        part2Title: 'HSK Speaking (Monologue)',
        description: 'Luyện tập hội thoại và độc thoại',
        voiceLabel: 'Chinese',
    }
};

const IeltsView: React.FC<IeltsViewProps> = (props) => {
    const { part, vocabularyList, topic, level, language, content, onContentChange } = props;
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [part1QuestionCount, setPart1QuestionCount] = useState<number>(5);

    const [part1SpeakingState, setPart1SpeakingState] = useState<{ [key: number]: SpeakingPracticeState }>({});
    const [part2SpeakingState, setPart2SpeakingState] = useState<SpeakingPracticeState>(initialSpeakingState);

    const config = UI_CONFIG[language];
    const testTitle = part === 1 ? config.part1Title : config.part2Title;

    useEffect(() => {
        setError(null);
        setPart1SpeakingState({});
        setPart2SpeakingState(initialSpeakingState);
    }, [vocabularyList, topic, level, part, language]);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        onContentChange(null);
        
        if (part === 1) {
            const result = await generateIeltsPart1AI(language, topic, part1QuestionCount, vocabularyList, level);
            (onContentChange as (content: IeltsPart1Item[] | null) => void)(result);
            if (!result) setError("Không thể tạo nội dung. Vui lòng thử lại.");
        } else {
            const result = await generateIeltsPart2AI(language, topic, vocabularyList, level);
            (onContentChange as (content: IeltsPart2Item | null) => void)(result);
             if (!result) setError("Không thể tạo nội dung. Vui lòng thử lại.");
        }
        setIsLoading(false);
    };
    
    const handleEvaluate = async (question: string, textAnswer: string, index?: number) => {
        if (!textAnswer.trim()) {
            alert("Vui lòng nhập câu trả lời của bạn.");
            return;
        }

        if (part === 1 && typeof index === 'number') {
            setPart1SpeakingState(prev => ({ ...prev, [index]: { ...prev[index], isEvaluating: true } }));
        } else {
            setPart2SpeakingState(prev => ({...prev, isEvaluating: true}));
        }

        const feedback = await evaluateIeltsSpeakingAI(language, part, topic, level, question, textAnswer, vocabularyList);

        if (part === 1 && typeof index === 'number') {
            setPart1SpeakingState(prev => ({ ...prev, [index]: { ...prev[index], isEvaluating: false, feedback: feedback ?? "Lỗi khi nhận xét." } }));
        } else {
            setPart2SpeakingState(prev => ({...prev, isEvaluating: false, feedback: feedback ?? "Lỗi khi nhận xét."}));
        }
    };
    
    const formatAIResponse = (text: string | null): string => {
        if (!text) return '';
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    };

    const renderSpeakingPractice = (question: string, index?: number) => {
        const isPart1 = part === 1 && typeof index === 'number';
        const state = isPart1 ? part1SpeakingState[index] || initialSpeakingState : part2SpeakingState;
        
        const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const newText = e.target.value;
             if (isPart1) {
                setPart1SpeakingState(prev => ({ ...prev, [index]: { ...initialSpeakingState, ...prev[index], textAnswer: newText } }));
            } else {
                setPart2SpeakingState(prev => ({ ...prev, textAnswer: newText }));
            }
        };

        return (
            <div className="mt-4 pt-4 border-t border-gray-700">
                <h4 className="font-semibold text-gray-300 mb-2 flex items-center gap-2"><PencilIcon/> Luyện tập trả lời:</h4>
                <textarea
                    rows={4}
                    value={state.textAnswer}
                    onChange={handleTextChange}
                    placeholder="Nhập câu trả lời của bạn tại đây..."
                    className="w-full p-2 border rounded-md shadow-sm bg-gray-700 border-gray-600 text-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
                />
                 <button
                     onClick={() => handleEvaluate(question, state.textAnswer, index)}
                     disabled={state.isEvaluating}
                     className="mt-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 transition disabled:bg-green-400 w-60 text-center flex items-center justify-center gap-2"
                 >
                    {state.isEvaluating && <Spinner />}
                     Nhận xét từ AI
                 </button>
                
                {state.feedback && (
                    <div className="mt-3 p-3 bg-gray-800 border border-gray-700 rounded-md text-gray-300">
                        <p className="font-semibold text-green-400 mb-1">AI Feedback:</p>
                         <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatAIResponse(state.feedback) }} />
                    </div>
                )}
            </div>
        );
    }

    const renderContent = () => {
        if (isLoading) return <div className="text-center text-indigo-400">🧠 AI đang làm việc...</div>;
        if (error) return <div className="text-center text-red-400">{error}</div>;

        if (part === 1) {
            if (Array.isArray(content) && content.length > 0) {
                return (
                    <div className="space-y-6">
                        {content.map((item, index) => (
                            <div key={index} className="bg-gray-900 p-4 rounded-lg">
                                <p className="font-semibold text-lg text-indigo-300">Q: {item.question}</p>
                                <div className="flex items-start gap-3 mt-2">
                                    <div className="flex-grow text-gray-300" dangerouslySetInnerHTML={{ __html: `<strong>A:</strong> ${item.answer}` }} />
                                    <button onClick={() => speakBrowser(item.answer.replace(/<[^>]+>/g, ''), language)} className="text-blue-400 hover:text-blue-300 flex-shrink-0" aria-label="Listen to answer">
                                        <PlayIcon />
                                    </button>
                                </div>
                                {renderSpeakingPractice(item.question, index)}
                            </div>
                        ))}
                    </div>
                );
            }
             return <p className="text-center text-gray-400">Nhấn nút "Tạo nội dung" để bắt đầu.</p>;
        }

        if (part === 2) {
             if (!content) return <p className="text-center text-gray-400">Nhấn nút "Tạo nội dung" để bắt đầu.</p>;

            if ('cue_card' in content) {
                const part2Content = content as IeltsPart2Item;
                const fullQuestion = `${part2Content.topic}\n- ${part2Content.cue_card.join('\n- ')}`;
                return (
                    <div className="space-y-6">
                        <div className="border border-indigo-500 p-4 rounded-lg bg-indigo-900/20">
                            <h3 className="font-bold text-xl text-indigo-300">{part2Content.topic}</h3>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-300">
                                {part2Content.cue_card.map((cue, index) => <li key={index}>{cue}</li>)}
                            </ul>
                        </div>
                         <div className="bg-gray-900 p-4 rounded-lg">
                             <h4 className="font-semibold text-lg text-indigo-300 mb-2">Sample Answer</h4>
                            <div className="flex items-start gap-3">
                                <div className="flex-grow text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: part2Content.answer }} />
                                 <button onClick={() => speakBrowser(part2Content.answer.replace(/<[^>]+>/g, ''), language)} className="text-blue-400 hover:text-blue-300 flex-shrink-0" aria-label="Listen to answer">
                                    <PlayIcon />
                                </button>
                            </div>
                            {renderSpeakingPractice(fullQuestion)}
                        </div>
                    </div>
                )
            }
        }
        
        return null;
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-indigo-400">{testTitle} Practice</h2>
                <p className="text-gray-400 mt-1">{config.description} chủ đề "{topic}"</p>
                
                {part === 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <label htmlFor="part1-q-count" className="text-sm font-medium text-gray-300">Số câu hỏi:</label>
                        <select
                            id="part1-q-count"
                            value={part1QuestionCount}
                            onChange={(e) => setPart1QuestionCount(Number(e.target.value))}
                            className="p-2 border rounded-md shadow-sm bg-gray-700 border-gray-600 text-gray-50"
                            disabled={isLoading}
                        >
                            <option value="3">3</option>
                            <option value="5">5</option>
                            <option value="7">7</option>
                        </select>
                    </div>
                )}
                
                <button 
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="mt-4 bg-indigo-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-indigo-700 transition disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                >
                    {isLoading && <Spinner />}
                    {content ? "Tạo lại" : "Tạo nội dung"}
                </button>
            </div>
            {renderContent()}
        </div>
    );
};

export default IeltsView;
