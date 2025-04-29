import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsultantService } from '../../../services/consultant.service';
import { Consultant } from '../../../models/consultant';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css'],
})
export class ContactUsComponent implements OnInit {
  consultants: Consultant[] = [];
  pagination: any = {
    current_page: 1,
    last_page: 1,
    links: [],
    total: 0,
  };
  isLoading = false;
  selectedConsultant: Consultant | null = null;

  constructor(private consultantService: ConsultantService) {}

  ngOnInit(): void {
    this.loadConsultants(1);
  }

  loadConsultants(page: number): void {
    this.isLoading = true;
    this.consultantService.getConsultants(page).subscribe({
      next: (response) => {
        this.consultants = response.data.data.sort((a: Consultant, b: Consultant) =>
          a.seen === b.seen ? 0 : a.seen ? 1 : -1
        );
        this.pagination = {
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          links: response.data.links,
          total: response.data.total,
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching consultants:', error);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to load consultants. Please try again.',
          timer: 3000,
          showConfirmButton: false,
        });
      },
    });
  }

  openModal(consultant: Consultant): void {
    this.selectedConsultant = consultant;
    // Mark as seen
    this.consultantService.markAsSeen(consultant.id).subscribe({
      next: (response) => {
        // Update the consultant in the list if seen status changed
        const updatedConsultant = response.data;
        const index = this.consultants.findIndex((c) => c.id === updatedConsultant.id);
        if (index !== -1) {
          this.consultants[index] = updatedConsultant;
          // Re-sort to ensure unseen remains first
          this.consultants = [...this.consultants].sort((a, b) =>
            a.seen === b.seen ? 0 : a.seen ? 1 : -1
          );
        }
      },
      error: (error) => {
        console.error('Error marking consultant as seen:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to mark consultant as seen.',
          timer: 3000,
          showConfirmButton: false,
        });
      },
    });
  }

  toggleSeenStatus(consultant: Consultant, event: Event): void {
    event.stopPropagation(); // Prevent card click from opening modal
    const newStatus = !consultant.seen;
    this.consultantService.markAsSeen(consultant.id).subscribe({
      next: (response) => {
        const updatedConsultant = response.data;
        const index = this.consultants.findIndex((c) => c.id === updatedConsultant.id);
        if (index !== -1) {
          this.consultants[index] = updatedConsultant;
          // Re-sort to ensure unseen remains first
          this.consultants = [...this.consultants].sort((a, b) =>
            a.seen === b.seen ? 0 : a.seen ? 1 : -1
          );
        }
        Swal.fire({
          icon: 'success',
          title: newStatus ? 'Marked as Seen' : 'Marked as Unseen',
          timer: 1500,
          showConfirmButton: false,
        });
      },
      error: (error) => {
        console.error('Error toggling seen status:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to update seen status.',
          timer: 3000,
          showConfirmButton: false,
        });
      },
    });
  }

  closeModal(): void {
    this.selectedConsultant = null;
  }

  deleteConsultant(id: number, fullName: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${fullName}'s consultation request.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.consultantService.deleteConsultant(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Consultation request deleted successfully.',
              timer: 2000,
              showConfirmButton: false,
            });
            this.closeModal();
            this.loadConsultants(this.pagination.current_page);
          },
          error: (error) => {
            console.error('Error deleting consultant:', error);
            Swal.fire({
              icon: 'error',
              title: 'Failed!',
              text: 'Failed to delete consultation request.',
              timer: 3000,
              showConfirmButton: false,
            });
          },
        });
      }
    });
  }

  goToPage(page: number | string): void {
    if (typeof page === 'string') {
      const pageNumber = parseInt(page, 10);
      if (!isNaN(pageNumber)) {
        this.loadConsultants(pageNumber);
      }
    } else {
      this.loadConsultants(page);
    }
  }
}