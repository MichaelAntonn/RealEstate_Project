import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { BlogService } from '../../services/blog.service';
import { Blog, PaginatedBlogs } from '../../models/blog';
import { normalizeTags } from '../../utils/normalize-tags'; // Update import path

@Component({
  selector: 'app-real-estate-blog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './real-estate-blog.component.html',
  styleUrls: ['./real-estate-blog.component.scss'],
})
export class RealEstateBlogComponent implements OnInit {
  activeCategory: string = 'all';
  searchQuery: string = '';
  posts: Blog[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.loadBlogs(this.currentPage);
  }

  loadBlogs(page: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.blogService.getBlogs(page).subscribe({
      next: (response: PaginatedBlogs) => {
        this.posts = response.blogs.map((post: Blog) => ({
          ...post,
          tags: normalizeTags(post.tags),
          created_at: new Date(post.created_at),
          likes: post.likes ?? 0,
          liked: post.liked ?? false,
        }));
        this.currentPage = response.current_page;
        this.totalPages = response.last_page;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching blogs:', error);
        this.errorMessage = 'Failed to load articles. Please try again later.';
        this.isLoading = false;
      },
    });
  }

  setCategory(category: string): void {
    this.activeCategory = category;
  }

  likePost(postId: number, event: Event): void {
    event.stopPropagation();
    const post = this.posts.find((p) => p.id === postId);
    if (post) {
      post.likes = (post.likes || 0) + 1;
      post.liked = true;

      setTimeout(() => {
        post.liked = false;
      }, 500);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.loadBlogs(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.loadBlogs(this.currentPage - 1);
    }
  }
}