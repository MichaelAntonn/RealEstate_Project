import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule ,RouterModule ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  isMenuCollapsed = true;
  defaultUserImage = 'assets/1.png';
  username = 'User';

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.getUsername();
  }

  toggleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  logout() {
    this.authService.logout();
    this.username = 'User'; // Reset username on logout
  }

  getUsername(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.username = user?.first_name && user?.last_name ? 
      `${user.first_name} ${user.last_name}` : 'User';
  }

  getUserImage(): string {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.image || this.defaultUserImage;
  }
}