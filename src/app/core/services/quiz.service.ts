import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { QuizApiResponse, QuizQuestion } from '../models/question.model';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = 'https://opentdb.com/api.php?amount=5';
  
  constructor(private http: HttpClient) { }
  
  getQuestions(): Observable<QuizQuestion[]> {
    return this.http.get<QuizApiResponse>(this.apiUrl).pipe(
      map(response => {
        if (response.response_code !== 0) {
          throw new Error(`API Error: Response code ${response.response_code}`);
        }
        console.log(response.results)
        // Process questions to decode HTML entities and shuffle answers
        return response.results.map(question => {
          const decoded = this.decodeHtmlEntities(question);
          return {
            ...decoded,
            // Combine and shuffle answers
            all_answers: this.shuffleAnswers([
              decoded.correct_answer, 
              ...decoded.incorrect_answers
            ])
          };
        });
      }),
      catchError(this.handleError)
    );
  }
  
  // Handle API errors
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
  
  // Decode HTML entities in the question and answers
  private decodeHtmlEntities(question: QuizQuestion): QuizQuestion {
    const textArea = document.createElement('textarea');
    
    // Decode question text
    textArea.innerHTML = question.question;
    const decodedQuestion = textArea.value;
    
    // Decode correct answer
    textArea.innerHTML = question.correct_answer;
    const decodedCorrectAnswer = textArea.value;
    
    // Decode incorrect answers
    const decodedIncorrectAnswers = question.incorrect_answers.map(answer => {
      textArea.innerHTML = answer;
      return textArea.value;
    });
    
    // Decode category
    textArea.innerHTML = question.category;
    const decodedCategory = textArea.value;
    
    return {
      ...question,
      question: decodedQuestion,
      correct_answer: decodedCorrectAnswer,
      incorrect_answers: decodedIncorrectAnswers,
      category: decodedCategory
    };
  }
  
  // Shuffle array of answers
  private shuffleAnswers(answers: string[]): string[] {
    const shuffled = [...answers];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  // Check if an answer is correct
  checkAnswer(question: QuizQuestion, selectedAnswer: string): boolean {
    return selectedAnswer === question.correct_answer;
  }
}