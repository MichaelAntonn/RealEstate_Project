import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faHeart, 
  faTrash, 
  faEye, 
  faSpinner,
  faHeartCrack,
  faBed,
  faBath,
  faRulerCombined
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Property {
  id: number;
  title: string;
  price: number;
  location: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  is_favorite?: boolean;
}

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  // Icons
  faHeart = faHeart;
  faTrash = faTrash;
  faEye = faEye;
  faSpinner = faSpinner;
  faHeartCrack = faHeartCrack;
  faBed = faBed;
  faBath = faBath;
  faRulerCombined = faRulerCombined;

  // API configuration
  private apiUrl = 'http://localhost:8000/';

  favorites: Property[] = [];
  isLoading: boolean = true;
  isEmpty: boolean = false;
  currentPage: number = 1;
  totalPages: number = 1;
  itemsPerPage: number = 8;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(page: number = 1): void {
    this.isLoading = true;
    const headers = this.authService.getAuthHeaders();
    
    this.http.get<any>(`http://localhost:8000/api/v1/properties/favorites/all`, { headers })
      .subscribe({
        next: (response) => {
          this.favorites = response.data.map((property: any) => ({
            ...property,
            is_favorite: true
          }));
          this.currentPage = response.current_page;
          this.totalPages = response.last_page;
          this.isEmpty = this.favorites.length === 0;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading favorites:', error);
          this.isLoading = false;
          this.isEmpty = true;
        }
      });
  }

  removeFavorite(propertyId: number): void {
    const headers = this.authService.getAuthHeaders();
    
    this.http.delete(`${this.apiUrl}/favorites/${propertyId}`, { headers })
      .subscribe({
        next: () => {
          // Remove from local array
          this.favorites = this.favorites.filter(fav => fav.id !== propertyId);
          this.isEmpty = this.favorites.length === 0;
        },
        error: (error) => {
          console.error('Error removing favorite:', error);
        }
      });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadFavorites(page);
    }
  }

  getPages(): number[] {
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}