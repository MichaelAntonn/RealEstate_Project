import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMenuCollapsed = true;
  defaultUserImage = 'assets/1.png';
  username = 'User';
  profileImage: string = this.defaultUserImage;
  private profileImageSubscription!: Subscription;
  private currentUserSubscription!: Subscription;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserData();

    // الاشتراك لتحديثات الصورة من AuthService
    this.profileImageSubscription = this.authService.profileImage$.subscribe(
      (newImage: string) => {
        this.profileImage = newImage || this.defaultUserImage;
      }
    );

    // الاشتراك لتحديثات بيانات المستخدم
    this.currentUserSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.updateUserInfo(user);
      }
    });
  }

  ngOnDestroy(): void {
    // تنظيف الاشتراكات عند تدمير المكون
    if (this.profileImageSubscription) {
      this.profileImageSubscription.unsubscribe();
    }
    if (this.currentUserSubscription) {
      this.currentUserSubscription.unsubscribe();
    }
  }

  loadUserData(): void {
    const user = this.authService.getUser();
    if (user) {
      this.updateUserInfo(user);
    }
  }

  private updateUserInfo(user: any): void {
    this.username = user?.first_name && user?.last_name ? 
      `${user.first_name} ${user.last_name}` : 
      user?.name || 'User'; // استخدام name من جوجل إذا لم يوجد first_name و last_name

    if (user?.profile_image) {
      this.profileImage = user.profile_image.startsWith('data:image') ? 
        user.profile_image : user.profile_image;
    } else if (user?.picture) { // إذا كان هناك صورة من جوجل
      this.profileImage = user.picture;
    } else {
      this.profileImage = this.defaultUserImage;
    }
  }

  toggleMenu(): void {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  logout(): void {
    this.authService.logout();
    this.resetUserData();
  }

  private resetUserData(): void {
    this.username = 'User';
    this.profileImage = this.defaultUserImage;
  }

  getUsername(): void {
    const user = this.authService.getUser();
    if (user) {
      this.updateUserInfo(user);
    }
  }

  getProfileImage(): string {
    const user = this.authService.getUser();
    if (!user) return this.defaultUserImage;

    if (user.profile_image) {
      return user.profile_image.startsWith('data:image') ? 
             user.profile_image : user.profile_image;
    } else if (user.picture) {
      return user.picture;
    }
    return this.defaultUserImage;
  }

  getUserImage(): string {
    return this.profileImage;
  }
}
