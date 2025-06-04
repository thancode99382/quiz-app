import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of } from 'rxjs';
import { QuizQuestion } from '../models/question.model';
import { QuizResult } from '../models/quiz-result.model';
import { QuizService } from './quiz.service';
import { TimerService } from './timer.service';

@Injectable({
  providedIn: 'root'
})
export class QuizStateService {
  private questions: QuizQuestion[] = [];
  private currentQuestionIndex = 0;
  private quizResult: QuizResult | null = null;
  
  // Observable sources
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private questionsSubject = new BehaviorSubject<QuizQuestion[]>([]);
  private currentQuestionSubject = new BehaviorSubject<QuizQuestion | null>(null);
  private quizResultSubject = new BehaviorSubject<QuizResult | null>(null);
  private feedbackSubject = new BehaviorSubject<{message: string, isCorrect: boolean} | null>(null);
  private errorSubject = new BehaviorSubject<string | null>(null);
  
  // Observable streams
  loading$ = this.loadingSubject.asObservable();
  questions$ = this.questionsSubject.asObservable();
  currentQuestion$ = this.currentQuestionSubject.asObservable();
  quizResult$ = this.quizResultSubject.asObservable();
  feedback$ = this.feedbackSubject.asObservable();
  error$ = this.errorSubject.asObservable();
  
  constructor(
    private quizService: QuizService,
    private timerService: TimerService
  ) {}
  
  // Start the quiz by loading questions and starting the timer
  startQuiz(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    this.timerService.startTimer();
    
    this.quizService.getQuestions().pipe(
      catchError(error => {
        this.errorSubject.next(error.message || 'Failed to load questions. Please try again.');
        this.loadingSubject.next(false);
        this.timerService.stopTimer();
        return of([]);
      })
    ).subscribe({
      next: (questions) => {
        if (questions.length === 0) {
          // If we caught an error above, we'll get an empty array
          return;
        }
        
        this.questions = questions;
        this.questionsSubject.next(this.questions);
        this.currentQuestionIndex = 0;
        this.currentQuestionSubject.next(this.questions[0]);
        this.loadingSubject.next(false);
      }
    });
  }
  
  // Answer the current question and move to the next one
  answerQuestion(selectedAnswer: string): void {
    if (!this.questions.length || this.currentQuestionIndex >= this.questions.length) {
      return;
    }
    
    const currentQuestion = this.questions[this.currentQuestionIndex];
    const isCorrect = this.quizService.checkAnswer(currentQuestion, selectedAnswer);
    
    // Update the question with the user's answer and whether it's correct
    this.questions[this.currentQuestionIndex] = {
      ...currentQuestion,
      selected_answer: selectedAnswer,
      is_correct: isCorrect
    };
    
    // Show feedback
    this.feedbackSubject.next({
      message: isCorrect ? 'Correct!' : 'Incorrect!',
      isCorrect
    });
    
    // Update observables
    this.questionsSubject.next(this.questions);
    
    // Clear feedback after 1.5 seconds
    setTimeout(() => {
      this.feedbackSubject.next(null);
      this.moveToNextQuestion();
    }, 1500);
  }
  
  // Move to the next question or finish the quiz
  private moveToNextQuestion(): void {
    this.currentQuestionIndex++;
    
    if (this.currentQuestionIndex < this.questions.length) {
      // Move to next question
      this.currentQuestionSubject.next(this.questions[this.currentQuestionIndex]);
    } else {
      // Finish the quiz
      this.finishQuiz();
    }
  }
  
  // Finish the quiz and calculate the results
  private finishQuiz(): void {
    // Stop the timer
    this.timerService.stopTimer();
    
    // Calculate results
    const totalTime = this.timerService.getElapsedTime();
    const correctAnswers = this.questions.filter(q => q.is_correct).length;
    const totalQuestions = this.questions.length;
    
    // 60% is passing grade (configurable)
    const passingScore = Math.ceil(totalQuestions * 0.6);
    const passed = correctAnswers >= passingScore;
    
    // Create result object
    this.quizResult = {
      totalQuestions,
      correctAnswers,
      totalTime,
      passed,
      questions: this.questions
    };
    
    // Update observable
    this.quizResultSubject.next(this.quizResult);
    this.currentQuestionSubject.next(null);
  }
  
  // Reset the quiz state for a new attempt
  resetQuiz(): void {
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.quizResult = null;
    this.questionsSubject.next([]);
    this.currentQuestionSubject.next(null);
    this.quizResultSubject.next(null);
    this.feedbackSubject.next(null);
    this.errorSubject.next(null);
    this.timerService.resetTimer();
  }
  
  // Get the current quiz progress (percentage)
  getProgress(): number {
    if (!this.questions.length) return 0;
    return ((this.currentQuestionIndex) / this.questions.length) * 100;
  }
  
  // Get the current question number (1-based)
  getCurrentQuestionNumber(): number {
    return this.currentQuestionIndex + 1;
  }
  
  // Get the total number of questions
  getTotalQuestions(): number {
    return this.questions.length;
  }
}