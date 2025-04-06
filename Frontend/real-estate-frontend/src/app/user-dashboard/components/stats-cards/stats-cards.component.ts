import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [],
  templateUrl: './stats-cards.component.html',
  styleUrls: ['./stats-cards.component.css']
})
export class StatsCardsComponent {
  @Input() listedCount: number = 0;
  @Input() bookedCount: number = 0;
  @Input() soldCount: number = 0;
}