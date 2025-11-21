
import React, { useState } from 'react';
import type { VocabularyItem, SpeakingQuestion, Language } from '../types';
import { generateSpeakingPracticeAI, checkSpeakingAnswerAI } from '../services/geminiService';
import { Spinner, CheckIcon } from './icons';

interface SpeakingPracticeViewProps {
    vocabularyList: VocabularyItem[];
    topic: string;
    level: string;
    language: Language;
    content: SpeakingQuestion[] | null;
    onContentChange: (content: SpeakingQuestion[] | null) => void;
    answers: { [key: number]: string };
    onAnswersChange: (answers: { [key: number]: string }) => void;
    feedback: { [key: number]: string | null };
    onFeedbackChange: (feedback: { [key: number]: string | null }) => void;
}

const SpeakingPracticeView: React.FC<SpeakingPracticeViewProps> = ({ 
    vocabularyList, 
    topic,
    level, 
    language,
    content, 
    onContentChange,
    answers,
    onAnswersChange,
    feedback,
    onFeedbackChange
}) => {
    const [isLoadingGenerate, setIsLoadingGenerate] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [questionCount, setQuestionCount] = useState(5);
    const [isLoadingCheck, setIsLoadingCheck] = useState<{ [key: number]: boolean }>({});
    
    const handleGenerate = async () => {
        setIsLoadingGenerate(true);
        setError(null);
        onAnswersChange({});
        onFeedbackChange({});
        setIsLoadingCheck({});

        const result = await generateSpeakingPracticeAI(language, topic, vocabularyList, questionCount, level);
        onContentChange(result);
        if (!result) {
            setError("Không thể tạo câu hỏi luyện tập. Vui lòng thử lại.");
        }
        setIsLoadingGenerate(false);
    };

    const handleAnswerChange = (index: number, text: string) => {
        onAnswersChange({ ...answers, [index]: text });
    };

    const handleCheckAnswer = async (index: number, question: string) => {
        const userAnswer = answers[index];
        if (!userAnswer || userAnswer.trim() === '') {
            onFeedbackChange({ ...feedback, [index]: "Vui lòng nhập câu trả lời của bạn." });
            return;
        }
        
        setIsLoadingCheck(prev => ({ ...prev, [index]: true }));
        onFeedbackChange({...feedback, [index]: null}); 

        const feedbackResult = await checkSpeakingAnswerAI(language, question, userAnswer, vocabularyList);
        onFeedbackChange({ ...feedback, [index]: feedbackResult || "Không thể nhận xét. Vui lòng thử lại." });

        setIsLoadingCheck(prev => ({ ...prev, [index]: false }));
    };

    const renderSetup = () => (
        <div className="text-center max-w-md mx-auto">
            <p className="text-gray-400 mb-4">AI sẽ tạo ra các câu hỏi về chủ đề "{topic}" ({language}) để bạn luyện tập.</p>
            <div className="flex items-center justify-center gap-4 mb-6">
                <label htmlFor="question-count" className="text-sm font-medium text-gray-300">Số câu hỏi:</label>
                <select
                    id="question-count"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="p-2 border rounded-md shadow-sm bg-gray-700 border-gray-600 text-gray-50"
                    disabled={isLoadingGenerate}
                >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                </select>
            </div>
            <button 
                onClick={handleGenerate}
                disabled={isLoadingGenerate}
                className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-indigo-700 transition disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
            >
                {isLoadingGenerate && <Spinner />}
                {content ? "Tạo lại" : "Bắt đầu luyện tập"}
            </button>
            {error && <p className="text-red-400 mt-4">{error}</p>}
        </div>
    );
    
    const renderPractice = () => {
        if (isLoadingGenerate) {
             return <div className="text-center text-indigo-400">🧠 AI đang chuẩn bị câu hỏi...</div>;
        }

        return (
            <div className="space-y-8">
                {content?.map((item, index) => (
                    <div key={index} className="bg-gray-900 p-4 rounded-lg">
                        <p className="font-semibold text-lg text-indigo-300">
                           <span className="text-gray-400 font-normal">{index + 1}.</span> {item.question}
                        </p>
                        <div className="flex flex-wrap gap-2 my-3">
                            <span className="text-xs text-gray-400">Gợi ý:</span>
                            {item.suggested_words.map(word => (
                                <span key={word} className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded-full">{word}</span>
                            ))}
                        </div>
                        <textarea
                            value={answers[index] || ''}
                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                            rows={3}
                            className="w-full p-2 border rounded-md shadow-sm text-base bg-gray-700 border-gray-600 text-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Nhập câu trả lời của bạn..."
                        />
                        <button
                            onClick={() => handleCheckAnswer(index, item.question)}
                            disabled={isLoadingCheck[index]}
                            className="mt-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 transition disabled:bg-green-400 w-40 text-center"
                        >
                            {isLoadingCheck[index] ? <Spinner /> : <><CheckIcon /> Kiểm tra</>}
                        </button>
                        {feedback[index] && (
                            <div className="mt-3 p-3 bg-gray-800 border border-gray-700 rounded-md text-gray-300">
                                <p className="font-semibold text-green-400 mb-1">AI Feedback:</p>
                                <p className="whitespace-pre-wrap">{feedback[index]}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )
    };

    return (
        <div className="max-w-3xl mx-auto">
            {renderSetup()}
            {content && <hr className="my-8 border-gray-700" />}
            {content && renderPractice()}
        </div>
    );
};

export default SpeakingPracticeView;
