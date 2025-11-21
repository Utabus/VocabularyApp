
import { GoogleGenAI, Modality } from "@google/genai";
import type { VocabularyItem, IeltsPart1Item, IeltsPart2Item, SpeakingQuestion, SpeakingSuggestion, ExampleSentencePair, Language } from '../types';
import { getStrategy } from './promptStrategies';

const getApiKey = (): string => {
    return process.env.API_KEY || localStorage.getItem('gemini_api_key') || '';
};

const getGenAI = (): GoogleGenAI => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("API Key is missing. Please log in or set the API_KEY environment variable.");
    }
    return new GoogleGenAI({ apiKey });
};

export const generateVocabularyAI = async (language: Language, topic: string, level: string, count: number): Promise<VocabularyItem[] | null> => {
  const prompt = getStrategy(language).getVocabularyPrompt(topic, level, count);

  try {
    const ai = getGenAI();
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        temperature: 0.4,
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text;
    const vocabData = JSON.parse(responseText);
    
    if (Array.isArray(vocabData) && vocabData.length > 0) {
      return vocabData;
    }
    throw new Error("Parsed data is not a valid vocabulary array.");

  } catch (error) {
    console.error("Gemini API call failed or parsing failed:", error);
    return null;
  }
};

export const generatePodcastAI = async (language: Language, topic: string, targetLength: number, vocabList: VocabularyItem[]): Promise<string | null> => {
  const prompt = getStrategy(language).getPodcastPrompt(topic, targetLength, vocabList);

  try {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Podcast generation failed:", error);
    return null;
  }
};

export const generateSpeechAI = async (text: string): Promise<{ audioData: string; mimeType: string; } | null> => {
    try {
        const ai = getGenAI();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say this clearly: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: "Kore" }
                    }
                }
            },
        });
        
        const part = response.candidates?.[0]?.content?.parts?.[0];
        const audioData = part?.inlineData?.data;
        const mimeType = part?.inlineData?.mimeType;

        if (!audioData || !mimeType) return null;
        return { audioData, mimeType };

    } catch (error) {
        console.error("Gemini TTS call failed:", error);
        return null;
    }
};

export const generateIeltsPart1AI = async (language: Language, topic: string, count: number, vocabList: VocabularyItem[], level: string): Promise<IeltsPart1Item[] | null> => {
    const prompt = getStrategy(language).getTestPart1Prompt(topic, count, vocabList, level);
    try {
        const ai = getGenAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text);
    } catch (error) {
        return null;
    }
};

export const generateIeltsPart2AI = async (language: Language, topic: string, vocabList: VocabularyItem[], level: string): Promise<IeltsPart2Item | null> => {
    const prompt = getStrategy(language).getTestPart2Prompt(topic, vocabList, level);
    try {
        const ai = getGenAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text);
    } catch (error) {
        return null;
    }
};

export const generateSpeakingPracticeAI = async (language: Language, topic: string, vocabList: VocabularyItem[], count: number, level: string): Promise<SpeakingQuestion[] | null> => {
    const prompt = getStrategy(language).getSpeakingPracticePrompt(topic, vocabList, count, level);
    try {
        const ai = getGenAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text);
    } catch (error) {
        return null;
    }
};

export const checkSpeakingAnswerAI = async (language: Language, question: string, userAnswer: string, vocabList: VocabularyItem[]): Promise<string | null> => {
    const prompt = getStrategy(language).getSpeakingCheckPrompt(question, userAnswer);
    try {
        const ai = getGenAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text;
    } catch (error) {
        return null;
    }
};

export const evaluateIeltsSpeakingAI = async (language: Language, part: 1 | 2, topic: string, level: string, question: string, userAnswer: string, vocabList: VocabularyItem[]): Promise<string | null> => {
    const prompt = getStrategy(language).getSpeakingEvaluationPrompt(part, topic, level, question, userAnswer);
    try {
        const ai = getGenAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text;
    } catch (error) {
        return null;
    }
};

export const generateSpeakingSuggestionsAI = async (language: Language, topic: string, level: string): Promise<SpeakingSuggestion[] | null> => {
    const prompt = getStrategy(language).getSpeakingSuggestionsPrompt(topic, level);
    try {
        const ai = getGenAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text);
    } catch (error) {
        return null;
    }
};

export const generateExampleSentencesAI = async (language: Language, word: string, level: string): Promise<ExampleSentencePair[] | null> => {
    const prompt = getStrategy(language).getExampleSentencesPrompt(word, level);
    try {
        const ai = getGenAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text);
    } catch (error) {
        return null;
    }
};
