// services-cards.component.ts
import { Component, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-services-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services-cards.component.html',
  styleUrls: ['./services-cards.component.css']
})
export class ServicesCardsComponent implements AfterViewInit {
  @ViewChildren('card') cards!: QueryList<ElementRef<HTMLElement>>;

  constructor(private router: Router) {}

  ngAfterViewInit() {
    this.setDefaultTiltedCard();
  }

  toggleTilt(event: MouseEvent) {
    const hoveredCard = event.currentTarget as HTMLElement;
    
    this.cards.forEach(card => {
      card.nativeElement.classList.remove('real-estate-tilted-card');
      card.nativeElement.classList.add('real-estate-normal-card');
    });
    
    hoveredCard.classList.add('real-estate-tilted-card');
    hoveredCard.classList.remove('real-estate-normal-card');
  }
  
  resetTilt() {
    const anyHovered = this.cards.some(card => 
      card.nativeElement.matches(':hover')
    );
    
    if (!anyHovered) {
      this.setDefaultTiltedCard();
    }
  }

  private setDefaultTiltedCard() {
    this.cards.forEach(card => {
      card.nativeElement.classList.remove('real-estate-tilted-card', 'real-estate-normal-card');
    });
    
    if (this.cards.length >= 2) {
      this.cards.toArray()[1].nativeElement.classList.add('real-estate-tilted-card');
    }
  }

  navigateToAddProperty() {
    this.router.navigate(['/add-property']);
  }
}