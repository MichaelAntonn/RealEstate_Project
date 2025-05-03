import { Component, AfterViewInit, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConsultationFormComponent } from '../consultation-form/consultation-form.component';

@Component({
  selector: 'app-consultation',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    ConsultationFormComponent,
  ],
  templateUrl: './consultation.component.html',
  styleUrls: ['./consultation.component.css'],
})
export class ConsultationComponent implements OnInit, AfterViewInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

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
