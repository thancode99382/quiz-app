import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { QuizQuestionComponent } from '../quiz-question/quiz-question';

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss'],
    standalone: true
})
export class WelcomeComponent {

    constructor(private router: Router) { }

    startQuiz(): void {
        this.router.navigate(['/quiz']);
    }
}