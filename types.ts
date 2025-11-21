
export interface ExampleSentencePair {
  en: string;
  vi: string;
}

export interface VocabularyItem {
  word: string;
  pos: string;
  ipa: string; // Will store Pinyin for Chinese
  meaning: string;
  example: string;
  en_definition: string; // Or Chinese definition
  vi_example: string;
  vi_example_full: string;
  vi_definition: string;
  generated_examples?: ExampleSentencePair[];
}

export type Tab = 'list' | 'flashcard' | 'quiz' | 'matching' | 'pronunciation' | 'sentenceQuiz' | 'definitionQuiz' | 'podcast' | 'ieltsPart1' | 'ieltsPart2' | 'speakingPractice' | 'speakingSuggestions' | 'exampleSentences';

export type Language = 'English' | 'Chinese';

export interface QuizQuestion {
  correctAnswer: VocabularyItem;
  options: VocabularyItem[];
}

export interface IeltsPart1Item {
    question: string;
    answer: string;
}

export interface IeltsPart2Item {
    topic: string;
    cue_card: string[];
    answer: string;
}

export interface VocabularySet {
  id: number;
  language: Language;
  topic: string;
  level: string;
  count: number;
  vocabularyList: VocabularyItem[];
}

export interface SpeakingQuestion {
    question: string;
    suggested_words: string[];
}

export interface PhrasePair {
  en: string;
  vi: string;
}

export interface SpeakingSuggestion {
  category: string;
  phrases: PhrasePair[];
}

export interface SpeakingSuggestionSet {
  id: number;
  topic: string;
  level: string;
  suggestions: SpeakingSuggestion[];
}
