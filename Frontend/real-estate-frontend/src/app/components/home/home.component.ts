import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { ServicesCardsComponent } from '../services-cards/services-cards.component';
import { FooterComponent } from '../footer/footer.component';
import { ShopCardsComponent } from '../shop-cards/shop-cards.component';
import { StatsCounterComponent } from '../stats-counter/stats-counter.component';
import { BannerSectionComponent } from './../banner-section/banner-section.component';
import { HeaderComponent } from '../header/header.component';
import { IconsComponent } from '../icons/icons.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user';
import { Location } from '@angular/common';



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
export class HomeComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private location: Location,

    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Check for access_token in query parameters
    this.route.queryParams.subscribe(params => {
      const token = params['access_token'];
      this.location.replaceState('/home');

      if (token) {
        // Store token in localStorage as auth_token
        localStorage.setItem('auth_token', token);
        this.authService.saveToken(token);

        // Fetch user data
        this.authService.getUser().subscribe({
          next: (user: User) => {
            this.authService.saveUser(user);
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: {}, // Clear query parameters
              replaceUrl: true // Avoid adding to browser history
            });
          },
          error: () => {
            console.error('Failed to fetch user data');
            // Remove access_token from URL even if user fetch fails
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: {},
              replaceUrl: true
            });
          }
        });
      }
    });
  }
}