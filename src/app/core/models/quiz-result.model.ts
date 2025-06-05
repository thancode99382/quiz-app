export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  totalTime: number; // in seconds
  passed: boolean;
  questions: any[]; // Questions with user's answers
}