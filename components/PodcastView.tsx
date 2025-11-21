
import React, { useState, useEffect, useRef } from 'react';
import type { VocabularyItem, Language } from '../types';
import { generatePodcastAI, generateSpeechAI } from '../services/geminiService';
import { playAiSpeech, speakBrowser } from '../services/audioService';
import { Spinner, PodcastPlayIcon } from './icons';

interface PodcastViewProps {
    vocabularyList: VocabularyItem[];
    topic: string;
    language?: Language;
}

const PodcastView: React.FC<PodcastViewProps> = ({ vocabularyList, topic, language = 'English' }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [script, setScript] = useState('');
    const [length, setLength] = useState(250);
    const [audioState, setAudioState] = useState<'idle' | 'loading' | 'playing'>('idle');
    
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
      return () => {
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current = null;
        }
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
      };
    }, [vocabularyList]);
    
    const handleGenerate = async () => {
        if (vocabularyList.length === 0) {
            alert("Vui lòng tạo danh sách từ vựng trước khi tạo podcast.");
            return;
        }
        setIsLoading(true);
        setScript('');
        const generatedScript = await generatePodcastAI(language, topic, length, vocabularyList);
        if (generatedScript) {
            setScript(generatedScript);
        } else {
            alert("Không thể tạo podcast. Vui lòng thử lại.");
        }
        setIsLoading(false);
    };

    const handlePlay = async () => {
        if (audioState === 'playing') {
            if (currentAudioRef.current) {
                currentAudioRef.current.pause();
                currentAudioRef.current = null;
            }
            if (speechSynthesis.speaking) {
                speechSynthesis.cancel();
            }
            setAudioState('idle');
            return;
        }

        const plainTextScript = script.replace(/<[^>]+>/g, ''); // Strip HTML

        setAudioState('loading');

        // Chinese Strategy: Use Browser TTS for reliability (Gemini TTS models often specific to English)
        if (language === 'Chinese') {
            speakBrowser(plainTextScript, 'Chinese');
            setAudioState('playing');
            // Rough estimate for "playing" state since browser doesn't give easy onend callback for this wrapper
            const estimatedDuration = plainTextScript.length * 200; 
            setTimeout(() => setAudioState('idle'), estimatedDuration);
            return;
        }

        // English Strategy: Try Gemini TTS
        const audioResponse = await generateSpeechAI(plainTextScript);
        if (audioResponse) {
            try {
                const audio = await playAiSpeech(audioResponse.audioData, audioResponse.mimeType);
                currentAudioRef.current = audio;
                setAudioState('playing');
                audio.onended = () => {
                    setAudioState('idle');
                    currentAudioRef.current = null;
                };
            } catch (error) {
                alert("Lỗi khi phát âm thanh AI, chuyển sang giọng đọc máy.");
                speakBrowser(plainTextScript, 'English');
                setAudioState('idle');
            }
        } else {
            // Fallback
            speakBrowser(plainTextScript, 'English');
            setAudioState('idle');
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <label htmlFor="podcast-length" className="text-sm font-medium text-gray-300">Độ dài:</label>
                    <select
                        id="podcast-length"
                        value={length}
                        onChange={(e) => setLength(Number(e.target.value))}
                        className="p-2 border rounded-md shadow-sm bg-gray-700 border-gray-600 text-gray-50"
                    >
                        <option value="150">~150 từ</option>
                        <option value="200">~200 từ</option>
                        <option value="250">~250 từ</option>
                        <option value="300">~300 từ</option>
                    </select>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="bg-teal-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-teal-700 transition disabled:bg-teal-400"
                >
                    {isLoading ? 'Đang tạo...' : 'Tạo Podcast'}
                </button>
            </div>

            {isLoading && (
                <div className="text-center">
                    <p className="text-teal-400">🎧 AI đang sáng tác podcast ({language}), vui lòng chờ...</p>
                </div>
            )}

            {script && (
                <div>
                    <div className="flex justify-center mb-4">
                        <button
                            onClick={handlePlay}
                            disabled={audioState === 'loading'}
                            className="flex items-center justify-center gap-2 bg-gray-600 text-gray-100 font-semibold py-2 px-4 rounded-md hover:bg-gray-700 transition w-48 h-12 disabled:bg-gray-500"
                        >
                            {audioState === 'loading' && <><Spinner /> <span>Đang tải...</span></>}
                            {audioState === 'playing' && <><Spinner /> <span>Dừng phát</span></>}
                            {audioState === 'idle' && <><PodcastPlayIcon /> <span>Nghe Podcast</span></>}
                        </button>
                    </div>
                    <div
                        className="prose prose-invert max-w-none text-justify bg-gray-900 p-4 rounded-lg leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: script.replace(/\n/g, '<br>') }}
                    />
                </div>
            )}
        </div>
    );
};

export default PodcastView;
