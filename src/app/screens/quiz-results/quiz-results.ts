import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quiz-results',
  standalone: true,
  templateUrl: './quiz-results.html',
  styleUrl: './quiz-results.scss'
})
export class QuizResultsComponent {
  constructor(private router: Router) {}
  
  backToHome(): void {
    this.router.navigate(['/welcome']);
  }
}
