import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quiz-question',
  standalone: true,
  templateUrl: './quiz-question.html',
  styleUrl: './quiz-question.scss'
})
export class QuizQuestionComponent {
  constructor(private router: Router) {}
  
  finishQuiz(): void {
    this.router.navigate(['/results']);
  }
}
