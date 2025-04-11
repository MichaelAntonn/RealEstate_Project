import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../../services/dashboard.service';

interface CostsSummary {
  total: number;
  fixed: number;
  variable: number;
  by_category: { [key: string]: number };
}

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

  showSummaryModal: boolean = false;
  summaryFilters = {
    month: undefined as number | undefined,
    year: undefined as number | undefined
  };
  summaryData: CostsSummary | null = null;
  summaryError: string | null = null;

  costsPagination = {
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10
  };

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
    this.loadCategories(); // استبدلنا loadCategoriesAndTypes بـ loadCategories
    this.loadTypes(); // فصلنا تحميل الـ types
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

  // دالة جديدة لتحميل الـ categories باستخدام getCostCategories
  loadCategories(): void {
    this.dashboardService.getCostCategories().subscribe({
      next: (categories: string[]) => {
        this.categories = categories;
        console.log('Categories loaded:', this.categories); // للتأكد من الـ response
      },
      error: (error: any) => console.error('Error fetching categories:', error)
    });
  }

  // دالة لتحميل الـ types من getCosts (أو ممكن تعدليها حسب الـ backend)
  loadTypes(): void {
    this.dashboardService.getCosts().subscribe({
      next: (response: { costs: any[]; pagination: any; categories: string[]; types: { [key: string]: string } }) => {
        this.types = response.types;
        console.log('Types loaded:', this.types);
      },
      error: (error: any) => console.error('Error fetching types:', error)
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
      if (!this.categories.includes(costData.category)) {
        this.categories.push(costData.category);
      }
    }
    delete costData.custom_category;
    this.dashboardService.createCost(costData).subscribe({
      next: (response: any) => {
        this.closeAddCostModal();
        if (this.showCostsModal) this.loadCosts(this.costsPagination.current_page);
        this.loadCategories(); // تحديث الـ categories بعد الإضافة
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
      if (!this.categories.includes(costData.category)) {
        this.categories.push(costData.category);
      }
    }
    delete costData.custom_category;
    delete costData.id;
    this.dashboardService.updateCost(this.editCost.id!, costData).subscribe({
      next: (response: any) => {
        this.closeEditCostModal();
        this.loadCosts(this.costsPagination.current_page);
        this.loadCategories(); // تحديث الـ categories بعد التعديل
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

  openSearchCostsModal(): void {
    this.showSearchCostsModal = true;
  }

  closeSearchCostsModal(): void {
    this.showSearchCostsModal = false;
    this.resetSearchFilters();
  }

  searchCosts(): void {
    if (this.searchFilters.month !== undefined && this.searchFilters.year !== undefined) {
      this.loadCosts(1, this.searchFilters);
      this.closeSearchCostsModal();
      this.showCostsModal = true;
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

  backToSearch(): void {
    this.showCostsModal = false;
    this.openSearchCostsModal();
  }

  openSummaryModal(): void {
    this.showSummaryModal = true;
    this.summaryData = null;
    this.summaryError = null;
  }

  closeSummaryModal(): void {
    this.showSummaryModal = false;
    this.resetSummaryFilters();
  }

  getCostsSummary(): void {
    if (this.summaryFilters.month !== undefined && this.summaryFilters.year !== undefined) {
      this.dashboardService.getCostsSummary(this.summaryFilters.month, this.summaryFilters.year).subscribe({
        next: (response: CostsSummary) => {
          this.summaryData = response;
          this.summaryError = null;
          console.log('Summary data:', this.summaryData);
        },
        error: (error: any) => {
          console.error('Error fetching costs summary:', error);
          this.summaryError = 'Failed to load costs summary. Please try again.';
          this.summaryData = null;
        }
      });
    } else {
      alert('Please enter both month and year to get the summary.');
    }
  }

  resetSummaryFilters(): void {
    this.summaryFilters = {
      month: undefined,
      year: undefined
    };
    this.summaryData = null;
    this.summaryError = null;
  }
}