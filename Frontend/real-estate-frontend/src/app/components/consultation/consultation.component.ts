import { Component, AfterViewInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-consultation',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './consultation.component.html',
  styleUrls: ['./consultation.component.css']
})
export class ConsultationComponent implements AfterViewInit {
  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    // إعداد IntersectionObserver لتفعيل الرسوم المتحركة
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // إلغاء المراقبة بعد الظهور
          }
        });
      },
      {
        threshold: 0.1, // تفعيل عند ظهور 10% من العنصر
        rootMargin: '50px' // هامش للتفعيل المبكر
      }
    );

    // مراقبة جميع العناصر التي تحتوي على scroll-animation
    const elements = document.querySelectorAll('.scroll-animation');
    elements.forEach((element) => {
      observer.observe(element);
    });
  }

  scrollToBooking(): void {
    this.router.navigate([], { fragment: 'booking' }).then(() => {
      const bookingSection = document.getElementById('booking');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}