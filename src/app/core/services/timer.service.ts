import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private timerSubject = new BehaviorSubject<number>(0);
  private startTime: number = 0;
  private timerInterval: any;
  
  timer$: Observable<number> = this.timerSubject.asObservable();
  
  constructor() {}
  
  startTimer(): void {
    this.resetTimer();
    this.startTime = Date.now();
    
    this.timerInterval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
      this.timerSubject.next(elapsedSeconds);
    }, 1000);
  }
  
  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
  
  resetTimer(): void {
    this.stopTimer();
    this.timerSubject.next(0);
  }
  
  getElapsedTime(): number {
    return this.timerSubject.value;
  }
  
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}