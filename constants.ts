
import { ColorTheme, TutorialStep, Achievement, UserStats } from './types';

export const COLORS: ColorTheme[] = [
  { bg: 'bg-red-500', hover: 'hover:bg-red-600', icon: '▲', text: 'text-red-500' },
  { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', icon: '◆', text: 'text-blue-500' },
  { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', icon: '●', text: 'text-yellow-500' },
  { bg: 'bg-green-500', hover: 'hover:bg-green-600', icon: '■', text: 'text-green-500' }
];

export const THEMES: Record<string, { label: string; gradient: string; text: string; accent: string }> = {
  classic: { 
    label: 'Classic Red', 
    gradient: 'from-red-600 to-red-900', 
    text: 'text-white',
    accent: 'bg-red-500'
  },
  cyberpunk: { 
    label: 'Cyberpunk', 
    gradient: 'from-slate-900 via-purple-900 to-slate-900', 
    text: 'text-cyan-400',
    accent: 'bg-cyan-500'
  },
  nature: { 
    label: 'Forest', 
    gradient: 'from-emerald-800 to-teal-900', 
    text: 'text-emerald-50',
    accent: 'bg-emerald-500'
  },
  ocean: { 
    label: 'Deep Sea', 
    gradient: 'from-blue-900 via-indigo-900 to-slate-900', 
    text: 'text-blue-100',
    accent: 'bg-blue-500'
  }
};

// Royalty-free tracks from public sources (e.g. Pixabay)
export const DEFAULT_MUSIC_TRACKS = [
  { id: 'none', label: 'No Music', url: '' },
  { id: 'chill', label: 'Chill Lo-Fi', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112762.mp3' },
  { id: 'upbeat', label: 'Upbeat Pop', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=upbeat-1-29008.mp3' },
  { id: 'suspense', label: 'Clockwork Tension', url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_0782fa9838.mp3?filename=clockwork-104975.mp3' },
  { id: 'epic', label: 'Epic Battle', url: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_5502c40c81.mp3?filename=action-rock-124971.mp3' }
];

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Welcome to QuizWhiz! 🧠",
    content: "Let's learn how to create an amazing quiz with our new Enhanced Learning features.",
    highlight: null
  },
  {
    title: "Step 1: Quiz Settings",
    content: "Enter a Title. You can also toggle 'Shuffle Questions' here to randomize the order for every player.",
    highlight: "title"
  },
  {
    title: "Step 2: Choose Question Type",
    content: "Select a type: Multiple Choice, True/False, Text Answer, or the new Ordering type (arrange items in correct sequence).",
    highlight: "type"
  },
  {
    title: "Step 3: Write & Visualize",
    content: "Type your question. You can use our upgraded AI Image Generator to create custom visuals in any aspect ratio!",
    highlight: "question"
  },
  {
    title: "Step 4: Answers & Order",
    content: "Fill in the options. For 'Ordering' questions, list them in the CORRECT order (top to bottom). We shuffle them for the player.",
    highlight: "answers"
  },
  {
    title: "Step 5: Add Explanations",
    content: "Enhance learning! Add an 'Explanation' to tell players WHY the answer is correct. This appears after they answer.",
    highlight: "explanation"
  },
  {
    title: "Step 6: Mark Correct (If needed)",
    content: "For Multiple Choice, mark the right answer. Text input needs exact text. Ordering just needs the list in correct order.",
    highlight: "correct"
  },
  {
    title: "Step 7: Finish Up",
    content: "Add more questions via the sidebar, then click Save. You can now play in Quiz Mode or Study Mode (Flashcards)!",
    highlight: "save"
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  // Creation
  { id: 'create_1', title: 'First Step', description: 'Create 1 Quiz', icon: '📝', condition: (s) => s.quizzesCreated >= 1 },
  { id: 'create_5', title: 'Creator', description: 'Create 5 Quizzes', icon: '✏️', condition: (s) => s.quizzesCreated >= 5 },
  { id: 'create_10', title: 'Architect', description: 'Create 10 Quizzes', icon: '📐', condition: (s) => s.quizzesCreated >= 10 },
  { id: 'create_25', title: 'Master Builder', description: 'Create 25 Quizzes', icon: '🏗️', condition: (s) => s.quizzesCreated >= 25 },
  { id: 'create_50', title: 'Legendary Author', description: 'Create 50 Quizzes', icon: '🏰', condition: (s) => s.quizzesCreated >= 50 },
  
  // Playing
  { id: 'play_1', title: 'Player One', description: 'Play 1 Quiz', icon: '🎮', condition: (s) => s.quizzesPlayed >= 1 },
  { id: 'play_10', title: 'Regular', description: 'Play 10 Quizzes', icon: '🕹️', condition: (s) => s.quizzesPlayed >= 10 },
  { id: 'play_50', title: 'Addict', description: 'Play 50 Quizzes', icon: '🎲', condition: (s) => s.quizzesPlayed >= 50 },
  { id: 'play_100', title: 'Centurion', description: 'Play 100 Quizzes', icon: '💯', condition: (s) => s.quizzesPlayed >= 100 },
  
  // Performance
  { id: 'perf_1', title: 'Brainiac', description: 'Get 1 Perfect Score', icon: '🧠', condition: (s) => s.perfectScores >= 1 },
  { id: 'perf_5', title: 'Honor Student', description: 'Get 5 Perfect Scores', icon: '🎖️', condition: (s) => s.perfectScores >= 5 },
  { id: 'perf_10', title: 'Perfectionist', description: 'Get 10 Perfect Scores', icon: '⭐', condition: (s) => s.perfectScores >= 10 },
  { id: 'perf_25', title: 'Unstoppable', description: 'Get 25 Perfect Scores', icon: '🚀', condition: (s) => s.perfectScores >= 25 },
  
  // Questions Answered
  { id: 'ans_10', title: 'Novice', description: 'Answer 10 Questions', icon: '👶', condition: (s) => s.questionsAnswered >= 10 },
  { id: 'ans_50', title: 'Learner', description: 'Answer 50 Questions', icon: '📖', condition: (s) => s.questionsAnswered >= 50 },
  { id: 'ans_100', title: 'Scholar', description: 'Answer 100 Questions', icon: '🎓', condition: (s) => s.questionsAnswered >= 100 },
  { id: 'ans_500', title: 'Encyclopedia', description: 'Answer 500 Questions', icon: '📚', condition: (s) => s.questionsAnswered >= 500 },
  { id: 'ans_1000', title: 'Oracle', description: 'Answer 1000 Questions', icon: '🔮', condition: (s) => s.questionsAnswered >= 1000 },
  
  // Study
  { id: 'study_1', title: 'Student', description: 'Use Study Mode 1 time', icon: '👓', condition: (s) => s.studySessions >= 1 },
  { id: 'study_10', title: 'Crammer', description: 'Use Study Mode 10 times', icon: '📒', condition: (s) => s.studySessions >= 10 },
  { id: 'study_50', title: 'Professor', description: 'Use Study Mode 50 times', icon: '👨‍🏫', condition: (s) => s.studySessions >= 50 },

  // AI
  { id: 'ai_quiz', title: 'Tech Savvy', description: 'Generate an AI Quiz', icon: '🤖', condition: (s) => s.aiQuizzesGenerated >= 1 },
  { id: 'ai_img', title: 'Artist', description: 'Generate an AI Image', icon: '🎨', condition: (s) => s.aiImagesGenerated >= 1 },
];