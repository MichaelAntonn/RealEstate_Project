import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CompanySidebarComponent } from '../company-sidebar/company-sidebar.component';
import { CompanyNavbarComponent } from '../company-navbar/company-navbar.component';

@Component({
  selector: 'app-company-layout',
  standalone: true,
  imports: [RouterOutlet, CompanySidebarComponent, CompanyNavbarComponent],
  templateUrl: './company-layout.component.html',
  styleUrls: ['./company-layout.component.css']
})
export class CompanyLayoutComponent {}