import { NgFor } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-details-section',
  imports: [NgFor],
  templateUrl: './details-section.component.html',
  styleUrl: './details-section.component.css'
})
export class DetailsSectionComponent {
  posts = [
    {
      image: 'https://placehold.co/600x400',
      category: 'Category',
      title: 'A picture is worth standard and stand us return'
    },
    {
      image: 'https://placehold.co/600x400',
      category: 'Category',
      title: 'Your journ homeownership starts here'
    },
    {
      image: 'https://placehold.co/600x400',
      category: 'Category',
      title: 'Trust us to guide you the a through the process'
    }
  ];
}
