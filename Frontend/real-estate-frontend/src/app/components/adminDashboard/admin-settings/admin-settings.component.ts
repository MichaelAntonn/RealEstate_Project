import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../../services/dashboard.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.css']
})
export class AdminSettingsComponent implements OnInit {
  showModal = false;
  adminForm = {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    country: '',
    city: '',
    address: '',
    terms_and_conditions: false,
    password: ''
  };
  errorMessage: string | null = null;
  successMessage: string | null = null;

  commissionRate: number = 0;
  newCommissionRate: number = 0;
  commissionError: string | null = null;
  commissionSuccess: string | null = null;

  costs: any[] = [];
  showCostsModal: boolean = false;
  showAddCostModal: boolean = false;
  showEditCostModal: boolean = false;
  showSearchCostsModal: boolean = false;

  // Pagination properties
  costsPagination = {
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10
  };

  // Search filters
  searchFilters = {
    type: '' as string | undefined,
    month: undefined as number | undefined,
    year: undefined as number | undefined,
    category: '' as string | undefined
  };

  newCost = {
    amount: 0,
    description: '',
    category: '',
    type: 'fixed' as const,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    custom_category: '' as string | undefined
  };

  editCost = {
    id: 0 as number | undefined,
    amount: 0,
    description: '',
    category: '',
    type: '' as 'fixed' | 'variable' | '',
    month: 0,
    year: 0,
    custom_category: '' as string | undefined
  };

  categories: string[] = [];
  types: { [key: string]: string } = {};

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.fetchCommissionRate();
    this.loadCategoriesAndTypes();
  }

  fetchCommissionRate(): void {
    this.dashboardService.getCommissionRate().subscribe({
      next: (response: { success: boolean; commission_rate: number; status: string }) => {
        if (response.success) {
          this.commissionRate = response.commission_rate * 100;
          this.newCommissionRate = this.commissionRate;
          console.log('Commission rate fetched:', this.commissionRate);
        }
      },
      error: (error: any) => {
        console.error('Error fetching commission rate:', error);
        this.commissionError = 'Failed to load commission rate.';
      }
    });
  }

  updateCommissionRate(): void {
    if (this.newCommissionRate < 0 || this.newCommissionRate > 100) {
      this.commissionError = 'Commission rate must be between 0% and 100%.';
      return;
    }

    this.dashboardService.updateCommissionRate(this.newCommissionRate / 100).subscribe({
      next: (response: any) => {
        this.commissionRate = this.newCommissionRate;
        this.commissionSuccess = 'Commission rate updated successfully!';
        this.commissionError = null;
        console.log('Commission rate updated:', this.commissionRate);
        setTimeout(() => this.commissionSuccess = null, 3000);
      },
      error: (error: any) => {
        console.error('Error updating commission rate:', error);
        this.commissionError = 'Failed to update commission rate.';
        this.commissionSuccess = null;
      }
    });
  }

  openModal(): void {
    this.showModal = true;
    this.errorMessage = null;
    this.successMessage = null;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  submitForm(): void {
    if (!this.adminForm.terms_and_conditions) {
      this.errorMessage = 'You must agree to the terms and conditions.';
      return;
    }

    this.dashboardService.createAdmin(this.adminForm).subscribe({
      next: (response: any) => {
        console.log('Admin created:', response);
        this.successMessage = 'Admin created successfully!';
        this.errorMessage = null;
        setTimeout(() => this.closeModal(), 2000);
      },
      error: (error: any) => {
        console.error('Error creating admin:', error);
        this.errorMessage = error.error?.message || 'Failed to create admin. Please try again.';
        this.successMessage = null;
      }
    });
  }

  resetForm(): void {
    this.adminForm = {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      country: '',
      city: '',
      address: '',
      terms_and_conditions: false,
      password: ''
    };
  }

  loadCategoriesAndTypes(): void {
    this.dashboardService.getCosts().subscribe({
      next: (response: { costs: any[]; pagination: any; categories: string[]; types: { [key: string]: string } }) => {
        this.categories = response.categories;
        this.types = response.types;
      },
      error: (error: any) => console.error('Error fetching categories and types:', error)
    });
  }

  loadCosts(page: number = 1, filters = this.searchFilters): void {
    this.dashboardService.getCosts(page, '', filters.month, filters.year, filters.type, filters.category).subscribe({
      next: (response: { costs: any[]; pagination: { current_page: number; last_page: number; total: number; per_page: number }; categories: string[]; types: { [key: string]: string } }) => {
        this.costs = response.costs || [];
        this.costsPagination = response.pagination;
        console.log('Costs:', this.costs, 'Pagination:', this.costsPagination);
      },
      error: (error: any) => console.error('Error fetching costs:', error)
    });
  }

  openCostsModal(): void {
    this.loadCosts(this.costsPagination.current_page);
    this.showCostsModal = true;
  }

  closeCostsModal(): void {
    this.showCostsModal = false;
  }

  setCostsPage(page: number): void {
    if (page >= 1 && page <= this.costsPagination.last_page) {
      this.costsPagination.current_page = page;
      this.loadCosts(page);
    }
  }

  openAddCostModal(): void {
    this.showAddCostModal = true;
  }

  closeAddCostModal(): void {
    this.showAddCostModal = false;
    this.resetNewCostForm();
  }

  addCost(): void {
    const costData = { ...this.newCost };
    if (costData.category === 'Other' && this.newCost.custom_category) {
      costData.category = this.newCost.custom_category;
    }
    delete costData.custom_category;
    this.dashboardService.createCost(costData).subscribe({
      next: (response: any) => {
        this.closeAddCostModal();
        if (this.showCostsModal) this.loadCosts(this.costsPagination.current_page);
      },
      error: (error: any) => console.error('Error adding cost:', error)
    });
  }

  openEditCostModal(cost: any): void {
    this.editCost = { ...cost, custom_category: cost.category };
    this.showEditCostModal = true;
  }

  closeEditCostModal(): void {
    this.showEditCostModal = false;
  }

  updateCost(): void {
    const costData = { ...this.editCost };
    if (costData.category === 'Other' && this.editCost.custom_category) {
      costData.category = this.editCost.custom_category;
    }
    delete costData.custom_category;
    delete costData.id;
    this.dashboardService.updateCost(this.editCost.id!, costData).subscribe({
      next: (response: any) => {
        this.closeEditCostModal();
        this.loadCosts(this.costsPagination.current_page);
      },
      error: (error: any) => console.error('Error updating cost:', error)
    });
  }

  deleteCost(id: number): void {
    if (confirm('Are you sure you want to delete this cost?')) {
      this.dashboardService.deleteCost(id).subscribe({
        next: (response: any) => {
          this.loadCosts(this.costsPagination.current_page);
        },
        error: (error: any) => console.error('Error deleting cost:', error)
      });
    }
  }

  resetNewCostForm(): void {
    this.newCost = {
      amount: 0,
      description: '',
      category: '',
      type: 'fixed',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      custom_category: ''
    };
  }

  // Search Modal Methods
  openSearchCostsModal(): void {
    this.showSearchCostsModal = true;
  }

  closeSearchCostsModal(): void {
    this.showSearchCostsModal = false;
    this.resetSearchFilters();
  }

  searchCosts(): void {
    if (this.searchFilters.month !== undefined && this.searchFilters.year !== undefined) {
      this.loadCosts(1, this.searchFilters); // جلب البيانات بس من غير فتح الـ View Costs تلقائيًا
      this.closeSearchCostsModal();
      this.showCostsModal = true; // فتح الـ View Costs بعد البحث
    } else {
      alert('Please enter both month and year to search.');
    }
  }

  resetSearchFilters(): void {
    this.searchFilters = {
      type: '',
      month: undefined,
      year: undefined,
      category: ''
    };
  }

  // New method to go back to Search Costs modal from View Costs modal
  backToSearch(): void {
    this.showCostsModal = false; // إغلاق الـ View Costs
    this.openSearchCostsModal(); // فتح الـ Search Costs
  }
}