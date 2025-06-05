export interface QuizQuestion {
  type: string;
  difficulty: string;
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  all_answers?: string[]; // Will be computed after fetching
  selected_answer?: string; // Will track user's selection
  is_correct?: boolean; // Will track if user answered correctly
}

export interface QuizApiResponse {
  response_code: number;
  results: QuizQuestion[];
}