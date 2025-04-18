import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { ServicesCardsComponent } from '../services-cards/services-cards.component';
import { FooterComponent } from '../footer/footer.component';
import { ShopCardsComponent } from '../shop-cards/shop-cards.component';
import { StatsCounterComponent } from '../stats-counter/stats-counter.component';
import { BannerSectionComponent } from './../banner-section/banner-section.component';
import { HeaderComponent } from '../header/header.component';
import { IconsComponent } from '../icons/icons.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NavbarComponent,
    ServicesCardsComponent,
    FooterComponent,
    ShopCardsComponent,
    StatsCounterComponent,
    BannerSectionComponent,
    HeaderComponent,
    IconsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {}
