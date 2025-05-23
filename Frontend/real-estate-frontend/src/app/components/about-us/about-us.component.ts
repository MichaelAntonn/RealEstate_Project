import { Component, AfterViewInit, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css',
})
export class AboutUsComponent implements AfterViewInit, OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0 });
  }

  ngAfterViewInit(): void {
    // Scroll Animation Functionality
    const animateElements = document.querySelectorAll(
      '.fade-in, .slide-in-left, .slide-in-right, .zoom-in'
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    animateElements.forEach((element) => {
      observer.observe(element);
    });

    // Button ripple effect
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach((button) => {
      button.addEventListener('click', function (this: HTMLElement, e: Event) {
        const mouseEvent = e as MouseEvent;
        const x = mouseEvent.clientX - this.getBoundingClientRect().left;
        const y = mouseEvent.clientY - this.getBoundingClientRect().top;

        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        this.appendChild(ripple);

        setTimeout(() => {
          ripple.remove();
        }, 1000);
      });
    });
  }

  navigateToconsultation(): void {
    this.router.navigate(['/consultation'], { fragment: 'booking' });
  }

  navigateToAddProperty(): void {
    window.scrollTo(0, 0); // Scroll to top before navigating
    this.router.navigate(['/add-property']);
  }
}
