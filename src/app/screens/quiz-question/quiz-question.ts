import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { QuizStateService } from '../../core/services/quiz-state.service';
import { TimerService } from '../../core/services/timer.service';
import { QuizQuestion } from '../../core/models/question.model';

@Component({
  selector: 'app-quiz-question',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-question.html',
  styleUrl: './quiz-question.scss'
})
export class QuizQuestionComponent implements OnInit, OnDestroy {
  currentQuestion: QuizQuestion | null = null;
  selectedAnswer: string | null = null;
  loading = false;
  feedback: {message: string, isCorrect: boolean} | null = null;
  errorMessage: string | null = null;
  timer = 0;
  progress = 0;
  currentQuestionNumber = 0;
  totalQuestions = 0;
  
  private subscriptions: Subscription[] = [];
  
  constructor(
    private router: Router,
    private quizStateService: QuizStateService,
    private timerService: TimerService
  ) {}
  
  ngOnInit(): void {
    // Subscribe to quiz state
    this.subscriptions.push(
      this.quizStateService.loading$.subscribe(loading => {
        this.loading = loading;
      }),
      
      this.quizStateService.currentQuestion$.subscribe(question => {
        this.currentQuestion = question;
        this.selectedAnswer = null;
        
        // If no question and not loading, navigate to results
        if (!question && !this.loading && !this.errorMessage) {
          this.router.navigate(['/results']);
        }
        
        // Update progress and question numbers
        this.progress = this.quizStateService.getProgress();
        this.currentQuestionNumber = this.quizStateService.getCurrentQuestionNumber();
        this.totalQuestions = this.quizStateService.getTotalQuestions();
      }),
      
      this.quizStateService.feedback$.subscribe(feedback => {
        this.feedback = feedback;
      }),
      
      this.quizStateService.error$.subscribe(error => {
        this.errorMessage = error;
      }),
      
      this.timerService.timer$.subscribe(time => {
        this.timer = time;
      })
    );
  }
  
  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  selectAnswer(answer: string): void {
    if (this.feedback || !this.currentQuestion) return; // Prevent selection during feedback
    
    this.selectedAnswer = answer;
    this.quizStateService.answerQuestion(answer);
  }
  
  getFormattedTime(): string {
    return this.timerService.formatTime(this.timer);
  }
  
  isAnswerSelected(answer: string): boolean {
    return this.selectedAnswer === answer;
  }
  
  goBackToWelcome(): void {
    this.router.navigate(['/welcome']);
  }
}
