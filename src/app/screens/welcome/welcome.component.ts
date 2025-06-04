import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { QuizStateService } from '../../core/services/quiz-state.service';

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss'],
    standalone: true
})
export class WelcomeComponent {

    constructor(
        private router: Router,
        private quizStateService: QuizStateService
    ) { }

    startQuiz(): void {
        // Reset any previous quiz state
        this.quizStateService.resetQuiz();
        
        // Start loading questions and navigate to quiz page
        this.quizStateService.startQuiz();
        this.router.navigate(['/quiz']);
    }
}