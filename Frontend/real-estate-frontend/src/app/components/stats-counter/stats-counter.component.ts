import { Component, OnInit, signal, ElementRef, ViewChild } from '@angular/core';
import { trigger, state, style, animate, transition, stagger, query, animateChild } from '@angular/animations';

interface StatItem {
  value: number;
  title: string;
  suffix: string;
  displayValue: number;
  icon: string;
  isCompleted: boolean;
  progressOffset: number;
}

@Component({
  selector: 'app-stats-counter',
  standalone: true,
  imports: [],
  templateUrl: './stats-counter.component.html',
  styleUrls: ['./stats-counter.component.css'],
  animations: [
    trigger('staggerAnimation', [
      transition(':enter', [
        query('.counter-item', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(200, [
            animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
          ]),
        ]),
      ]),
    ]),
    trigger('spinAndGlow', [
      state('notCompleted', style({ transform: 'rotate(0deg)' })),
      state('completed', style({ transform: 'rotate(360deg)' })),
      transition('notCompleted => completed', animate('500ms ease-in-out')),
    ]),
    trigger('shakeIcon', [
      state('notCompleted', style({ transform: 'translateX(0)' })),
      state('completed', style({ transform: 'translateX(0)' })),
      transition('notCompleted => completed', [
        animate('500ms ease-in-out', style({ transform: 'translateX(3px)' })),
        animate('500ms ease-in-out', style({ transform: 'translateX(-3px)' })),
        animate('500ms ease-in-out', style({ transform: 'translateX(0)' })),
      ]),
    ]),
  ],
})
export class StatsCounterComponent implements OnInit {
  @ViewChild('counterSection', { static: true }) counterSection!: ElementRef;

  stats = signal<StatItem[]>([
    { value: 800, title: 'Happy Client', suffix: '+', displayValue: 0, icon: '<i class="fas fa-home"></i>', isCompleted: false, progressOffset: 226 },
    { value: 440, title: 'Project Done', suffix: '+', displayValue: 0, icon: '<i class="fas fa-check-circle"></i>', isCompleted: false, progressOffset: 226 },
    { value: 500, title: 'Employees', suffix: 'k', displayValue: 0, icon: '<i class="fas fa-users"></i>', isCompleted: false, progressOffset: 226 },
    { value: 80, title: 'Award Winning', suffix: '+', displayValue: 0, icon: '<i class="fas fa-trophy"></i>', isCompleted: false, progressOffset: 226 },
  ]);

  ngOnInit(): void {
    this.observeSection();
  }

  observeSection(): void {
    if (!this.counterSection?.nativeElement) {
      console.error('Counter section element not found');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.animateCounters();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(this.counterSection.nativeElement);
  }

  animateCounters(): void {
    const duration = 2000; // قللنا المدة عشان تتطابق مع الـ CSS
    const startTime = performance.now();
    const circumference = 2 * Math.PI * 36;

    const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easedProgress = easeInOutQuad(progress);

      this.stats.update((currentStats) =>
        currentStats.map((stat) => ({
          ...stat,
          displayValue: Math.floor(easedProgress * stat.value),
          progressOffset: circumference * (1 - easedProgress),
          isCompleted: easedProgress === 1,
        }))
      );

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.stats.update((currentStats) =>
          currentStats.map((stat) => ({
            ...stat,
            displayValue: stat.value,
            progressOffset: 0,
            isCompleted: true,
          }))
        );
      }
    };

    requestAnimationFrame(animate);
  }
}
