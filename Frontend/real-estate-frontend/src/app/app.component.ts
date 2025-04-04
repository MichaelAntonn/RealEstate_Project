import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // Remove AdminDashboardComponent from imports
  template: `
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {}