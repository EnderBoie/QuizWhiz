
export type QuestionType = 'multiple-choice' | 'true-false' | 'text-input' | 'ordering';

export interface UserStats {
  quizzesCreated: number;
  quizzesPlayed: number;
  questionsAnswered: number;
  perfectScores: number;
  studySessions: number;
  aiQuizzesGenerated: number;
  aiImagesGenerated: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: UserStats) => boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  hasSeenTutorial?: boolean;
  stats: UserStats;
  achievements: string[]; // Array of Achievement IDs
  history: QuizResult[];
}

export interface Question {
  question: string;
  image: string;
  type: QuestionType;
  options: string[];
  correctAnswer: number | string | null; 
  timeLimit: number;
  explanation?: string;
}

export interface CustomTheme {
  background: string; // Hex color
  backgroundImage?: string; // URL
  text: string;    // Hex color
  accent: string;  // Hex color for buttons
  cardColor: string; // Hex color for cards
  cardOpacity: number; // 0 to 1
}

export interface Quiz {
  id: number;
  userId: string;
  title: string;
  questions: Question[];
  createdAt: string;
  theme?: string;
  customTheme?: CustomTheme;
  shuffleQuestions?: boolean;
  backgroundMusic?: string; // URL or DataURI for background music
}

export interface QuizResult {
  id: string; // Unique ID for the result
  quizId: number;
  quizTitle: string;
  date: string;
  score: number;
  totalQuestions: number;
  answers: (number | string | number[])[]; 
}

export interface ColorTheme {
  bg: string;
  hover: string;
  icon: string;
  text: string;
}

export interface TutorialStep {
  title: string;
  content: string;
  highlight: string | null;
}
