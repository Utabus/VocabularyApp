
import type { Language, VocabularyItem } from '../types';

interface PromptStrategy {
    getVocabularyPrompt: (topic: string, level: string, count: number) => string;
    getPodcastPrompt: (topic: string, length: number, vocabList: VocabularyItem[]) => string;
    getTestPart1Prompt: (topic: string, count: number, vocabList: VocabularyItem[], level: string) => string;
    getTestPart2Prompt: (topic: string, vocabList: VocabularyItem[], level: string) => string;
    getSpeakingPracticePrompt: (topic: string, vocabList: VocabularyItem[], count: number, level: string) => string;
    getSpeakingCheckPrompt: (question: string, userAnswer: string) => string;
    getSpeakingEvaluationPrompt: (part: 1 | 2, topic: string, level: string, question: string, userAnswer: string) => string;
    getSpeakingSuggestionsPrompt: (topic: string, level: string) => string;
    getExampleSentencesPrompt: (word: string, level: string) => string;
}

const EnglishStrategy: PromptStrategy = {
    getVocabularyPrompt: (topic, level, count) => `
        You are an expert English teacher creating vocabulary lists for Vietnamese students. 
        Produce EXACTLY one JSON value and NOTHING ELSE: a JSON array containing exactly ${count} objects.

        Requirements:
        1. Output must be a single valid JSON array.
        2. Array length: ${count}.
        3. JSON Structure:
           - "word": string (English word)
           - "pos": string (part of speech)
           - "ipa": string (IPA pronunciation)
           - "meaning": string (Vietnamese meaning)
           - "example": string (English sentence)
           - "en_definition": string (Short English definition)
           - "vi_example": string (Vietnamese translation of example, keyword replaced with '_______')
           - "vi_example_full": string (Full Vietnamese translation)
           - "vi_definition": string (Vietnamese definition)
        
        Context: CEFR Level ${level}, Topic "${topic}".
    `,
    getPodcastPrompt: (topic, length, vocabList) => `
        You are an experienced English podcast scriptwriter.
        Write a natural English podcast script about "${topic}", around ${length} words.
        Include these words naturally (wrap in <strong>...</strong> tags): ${vocabList.map(v => `"${v.word}"`).join(', ')}.
        Output ONLY the script text.
    `,
    getTestPart1Prompt: (topic, count, vocabList, level) => `
        Role: IELTS Speaking Part 1 Examiner.
        Task: Generate exactly ${count} Q&A pairs.
        Topic: "${topic}". Level: ${level}.
        Output: JSON array of { "question": string, "answer": string }.
        Constraint: Answers MUST use these words (wrap in <strong>...</strong>): ${vocabList.map(v => `"${v.word}"`).join(', ')}.
    `,
    getTestPart2Prompt: (topic, vocabList, level) => `
        Role: IELTS Speaking Part 2 Examiner.
        Task: Generate a Cue Card and Sample Answer.
        Topic: "${topic}". Level: ${level}.
        Output: JSON object { "topic": string, "cue_card": string[], "answer": string }.
        Constraint: Answer MUST use these words (wrap in <strong>...</strong>): ${vocabList.map(v => `"${v.word}"`).join(', ')}.
    `,
    getSpeakingPracticePrompt: (topic, vocabList, count, level) => `
        Role: English Conversation Coach. Topic: "${topic}". Level: ${level}.
        Task: Generate ${count} practice questions.
        Output: JSON array { "question": string, "suggested_words": string[] }.
        Select suggested_words from: ${vocabList.map(v => `"${v.word}"`).join(', ')}.
    `,
    getSpeakingCheckPrompt: (question, userAnswer) => `
        Role: English Teacher.
        Task: Evaluate student answer in VIETNAMESE.
        Question: "${question}"
        Answer: "${userAnswer}"
        Provide: 1. Correction, 2. Improvements, 3. Friendly tone.
    `,
    getSpeakingEvaluationPrompt: (part, topic, level, question, userAnswer) => `
        Role: IELTS Examiner. Part: ${part}.
        Topic: "${topic}". Question: "${question}". Answer: "${userAnswer}". Level: ${level}.
        Task: Provide detailed feedback in VIETNAMESE (Fluency, Vocabulary, Grammar).
    `,
    getSpeakingSuggestionsPrompt: (topic, level) => `
        Role: English Teacher. Topic: "${topic}". Level: ${level}.
        Task: Generate structured conversation phrases.
        Output: JSON array { "category": "Vietnamese label", "phrases": [{"en": "English phrase", "vi": "Vietnamese translation"}] }.
    `,
    getExampleSentencesPrompt: (word, level) => `
        Generate 5 example sentences for "${word}" in English (Level ${level}).
        Output: JSON array { "en": "English sentence", "vi": "Vietnamese translation" }.
    `
};

const ChineseStrategy: PromptStrategy = {
    getVocabularyPrompt: (topic, level, count) => `
        You are an expert Chinese (Mandarin) teacher creating vocabulary lists for Vietnamese students. 
        Produce EXACTLY one JSON value and NOTHING ELSE: a JSON array containing exactly ${count} objects.

        Requirements:
        1. Output must be a single valid JSON array.
        2. Array length: ${count}.
        3. JSON Structure:
           - "word": string (Chinese Characters / Hanzi)
           - "pos": string (Part of speech)
           - "ipa": string (Pinyin with tone marks)
           - "meaning": string (Vietnamese meaning)
           - "example": string (Chinese sentence, Simplified Chinese)
           - "en_definition": string (Definition in Chinese)
           - "vi_example": string (Vietnamese translation, keyword replaced with '_______')
           - "vi_example_full": string (Full Vietnamese translation)
           - "vi_definition": string (Vietnamese definition)
        
        Context: HSK Level ${level}, Topic "${topic}".
        IMPORTANT: Ideally pick vocabulary from the official HSK list if the topic is generic.
    `,
    getPodcastPrompt: (topic, length, vocabList) => `
        You are a Chinese podcast scriptwriter.
        Write a script in Simplified Chinese about "${topic}", around ${length} words.
        Use Pinyin in parentheses for difficult words.
        Include these words naturally (wrap in <strong>...</strong> tags): ${vocabList.map(v => `"${v.word}"`).join(', ')}.
        Output ONLY the script text.
    `,
    getTestPart1Prompt: (topic, count, vocabList, level) => `
        Role: HSK Speaking (Introduction) Examiner.
        Task: Generate exactly ${count} Q&A pairs.
        Topic: "${topic}". Level: ${level}.
        Output: JSON array { "question": string, "answer": string }.
        Constraint: Answers MUST use these words (wrap in <strong>...</strong>): ${vocabList.map(v => `"${v.word}"`).join(', ')}.
    `,
    getTestPart2Prompt: (topic, vocabList, level) => `
        Role: HSK Speaking (Monologue) Examiner.
        Task: Generate a Topic/Cue and Sample Answer.
        Topic: "${topic}". Level: ${level}.
        Output: JSON object { "topic": string, "cue_card": string[], "answer": string }.
        Constraint: Answer MUST use these words (wrap in <strong>...</strong>): ${vocabList.map(v => `"${v.word}"`).join(', ')}.
    `,
    getSpeakingPracticePrompt: (topic, vocabList, count, level) => `
        Role: Chinese Conversation Coach. Topic: "${topic}". Level: ${level}.
        Task: Generate ${count} practice questions in Chinese.
        Output: JSON array { "question": string, "suggested_words": string[] }.
        Select suggested_words from: ${vocabList.map(v => `"${v.word}"`).join(', ')}.
    `,
    getSpeakingCheckPrompt: (question, userAnswer) => `
        Role: Chinese Teacher.
        Task: Evaluate student answer in VIETNAMESE.
        Question: "${question}"
        Answer: "${userAnswer}"
        Provide: 1. Correction (Hanzi/Pinyin), 2. Improvements, 3. Friendly tone.
    `,
    getSpeakingEvaluationPrompt: (part, topic, level, question, userAnswer) => `
        Role: HSK Speaking Examiner.
        Topic: "${topic}". Question: "${question}". Answer: "${userAnswer}". Level: ${level}.
        Task: Provide detailed feedback in VIETNAMESE (Fluency, Tones, Grammar).
    `,
    getSpeakingSuggestionsPrompt: (topic, level) => `
        Role: Chinese Teacher. Topic: "${topic}". Level: ${level}.
        Task: Generate structured conversation phrases.
        Output: JSON array { "category": "Vietnamese label", "phrases": [{"en": "Chinese phrase (Hanzi)", "vi": "Vietnamese translation"}] }.
        NOTE: Keep key as "en" for the Chinese phrase to match the data structure.
    `,
    getExampleSentencesPrompt: (word, level) => `
        Generate 5 example sentences for "${word}" in Chinese (Level ${level}).
        Output: JSON array { "en": "Chinese sentence", "vi": "Vietnamese translation" }.
        NOTE: Keep key as "en" for the Chinese sentence.
    `
};

export const getStrategy = (language: Language): PromptStrategy => {
    return language === 'Chinese' ? ChineseStrategy : EnglishStrategy;
};
