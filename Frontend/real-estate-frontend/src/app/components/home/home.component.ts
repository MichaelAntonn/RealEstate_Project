import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { BannerComponent } from '../banner/banner.component';
import { ServicesCardsComponent } from '../services-cards/services-cards.component';
import { PropertyCardsComponent } from '../property-cards/property-cards.component';
import { FooterComponent } from '../footer/footer.component';
import { IconsComponent } from '../icons/icons.component';
import { ShopCardsComponent } from '../shop-cards/shop-cards.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NavbarComponent,
    BannerComponent,
    ServicesCardsComponent,
    PropertyCardsComponent,
    FooterComponent,
    IconsComponent,
    ShopCardsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {}
