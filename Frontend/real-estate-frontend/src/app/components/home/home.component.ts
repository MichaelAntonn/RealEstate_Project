import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { ServicesCardsComponent } from '../services-cards/services-cards.component';
import { PropertyCardsComponent } from '../property-cards/property-cards.component';
import { FooterComponent } from '../footer/footer.component';
import { ShopCardsComponent } from '../shop-cards/shop-cards.component';
import { StatsCounterComponent } from '../stats-counter/stats-counter.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NavbarComponent,
    ServicesCardsComponent,
    PropertyCardsComponent,
    FooterComponent,
    ShopCardsComponent,
    StatsCounterComponent,
    HeaderComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {}
