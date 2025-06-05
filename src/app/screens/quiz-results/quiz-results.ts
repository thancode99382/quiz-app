import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { QuizStateService } from '../../core/services/quiz-state.service';
import { TimerService } from '../../core/services/timer.service';
import { QuizResult } from '../../core/models/quiz-result.model';
import { QuizQuestion } from '../../core/models/question.model';

@Component({
  selector: 'app-quiz-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-results.html',
  styleUrl: './quiz-results.scss',
  encapsulation: ViewEncapsulation.None
})
export class QuizResultsComponent implements OnInit, OnDestroy {
  quizResult: QuizResult | null = null;
  showReview = false;
  animationDelay = 0;
  
  private subscriptions: Subscription[] = [];
  
  constructor(
    private router: Router,
    private quizStateService: QuizStateService,
    private timerService: TimerService
  ) {}
  
  ngOnInit(): void {
    // Subscribe to quiz result
    this.subscriptions.push(
      this.quizStateService.quizResult$.subscribe(result => {
        this.quizResult = result;
        
        // If no result, redirect to welcome page
        if (!result) {
          this.router.navigate(['/welcome']);
        }
      })
    );
  }
  
  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  getFormattedTime(seconds: number): string {
    return this.timerService.formatTime(seconds);
  }
  
  getScorePercentage(): number {
    if (!this.quizResult) return 0;
    return Math.round((this.quizResult.correctAnswers / this.quizResult.totalQuestions) * 100);
  }
  
  getScoreColor(): string {
    const percentage = this.getScorePercentage();
    if (percentage >= 80) return '#4caf50'; // Green
    if (percentage >= 60) return '#ff9800'; // Orange
    return '#f44336'; // Red
  }
  
  getPassMessage(): string {
    if (!this.quizResult) return '';
    return this.quizResult.passed ? 
      'Congratulations! You passed the quiz.' : 
      'Sorry, you didn\'t pass the quiz. Better luck next time!';
  }
  
  getPerformanceMessage(): string {
    const percentage = this.getScorePercentage();
    if (percentage >= 90) return 'Excellent! You\'re a quiz master!';
    if (percentage >= 80) return 'Great job! You really know your stuff.';
    if (percentage >= 70) return 'Good work! You have solid knowledge.';
    if (percentage >= 60) return 'Not bad! You\'ve passed the quiz.';
    if (percentage >= 50) return 'You\'re getting there! A bit more study will help.';
    return 'Keep practicing! You\'ll do better next time.';
  }
  
  toggleReview(): void {
    this.showReview = !this.showReview;
  }
  
  restartQuiz(): void {
    this.quizStateService.resetQuiz();
    this.router.navigate(['/welcome']);
  }
  
  getAnimationDelay(index: number): string {
    return `${index * 0.15}s`;
  }
  
  getCategoryCount(): { [key: string]: number } {
    if (!this.quizResult) return {};
    
    const categories: { [key: string]: number } = {};
    this.quizResult.questions.forEach(q => {
      categories[q.category] = (categories[q.category] || 0) + 1;
    });
    
    return categories;
  }
  
  getCorrectByCategory(): { [key: string]: { total: number, correct: number } } {
    if (!this.quizResult) return {};
    
    const categories: { [key: string]: { total: number, correct: number } } = {};
    this.quizResult.questions.forEach(q => {
      if (!categories[q.category]) {
        categories[q.category] = { total: 0, correct: 0 };
      }
      
      categories[q.category].total++;
      if (q.is_correct) {
        categories[q.category].correct++;
      }
    });
    
    return categories;
  }
}
