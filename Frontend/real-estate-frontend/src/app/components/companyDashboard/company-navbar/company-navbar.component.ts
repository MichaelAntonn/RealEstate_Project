import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyAuthService } from '../../../services/company-auth.service';

@Component({
  selector: 'app-company-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-navbar.component.html',
  styleUrls: ['./company-navbar.component.css']
})
export class CompanyNavbarComponent implements OnInit {
  egyptTime: Date = new Date();
  companyName: string = 'Guest';
  companyLogo: string = 'https://www.pngmart.com/files/23/Profile-PNG-Photo.png';

  constructor(private companyAuthService: CompanyAuthService) {}

  ngOnInit(): void {
    console.log('CompanyNavbarComponent loaded');
    this.updateTime();
    this.fetchCompanyDetails();
  }

  updateTime(): void {
    setInterval(() => {
      this.egyptTime = new Date();
    }, 1000);
  }

  fetchCompanyDetails(): void {
    if (this.companyAuthService.isLoggedIn()) {
      const company = this.companyAuthService.getCompanyData();
      if (company) {
        this.companyName = company.company_name || 'Company User';
        this.companyLogo = company.logo ? `http://localhost:8000/${company.logo}` : this.companyLogo;
        console.log('Company details fetched:', { name: this.companyName, logo: this.companyLogo });
      }
    } else {
      console.log('No company logged in, using default values');
    }
  }

  logout(): void {
    this.companyAuthService.logout();
  }
}