import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { CompanyAuthService } from '../../../services/company-auth.service';

@Component({
  selector: 'app-company-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-navbar.component.html',
  styleUrls: ['./company-navbar.component.css']
})
export class CompanyNavbarComponent  {
  egyptTime: Date = new Date();
  userName: string = 'Guest';
  userImage: string = 'https://www.pngmart.com/files/23/Profile-PNG-Photo.png';

  constructor() {}

  // ngOnInit(): void {
  //   this.updateTime();
  //   this.fetchUserDetails();
  // }

  // updateTime(): void {
  //   setInterval(() => {
  //     this.egyptTime = new Date();
  //   }, 1000);
  // }

  // fetchUserDetails(): void {
  //   if (this.companyAuthService.isLoggedIn()) {
  //     this.companyAuthService.getUserProfile().subscribe({
  //       next: (profile) => {
  //         this.userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Company User';
  //         this.userImage = profile.profile_image || this.userImage;
  //         console.log('Company user details fetched:', { name: this.userName, image: this.userImage });
  //       },
  //       error: (error) => {
  //         console.error('Error in fetchUserDetails:', error);
  //         this.userName = 'Company User';
  //       }
  //     });
  //   } else {
  //     console.log('Company user not logged in, using default values');
  //   }
  // }

  // logout(): void {
  //   this.companyAuthService.logout();
  //   console.log('Company user logged out');
  // }
}