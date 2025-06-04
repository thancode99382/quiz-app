import { Routes } from '@angular/router';
import { WelcomeComponent } from './screens/welcome/welcome.component';
import { QuizQuestionComponent } from './screens/quiz-question/quiz-question';
import { QuizResultsComponent } from './screens/quiz-results/quiz-results';

export const routes: Routes = [
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'quiz', component: QuizQuestionComponent },
  { path: 'results', component: QuizResultsComponent },
  { path: '**', redirectTo: 'welcome' } // Wildcard route for 404 page
];
