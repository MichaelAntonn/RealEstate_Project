import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { BlogService } from '../../services/blog.service';
import { Blog, PaginatedBlogs } from '../../models/blog';
import { normalizeTags } from '../../utils/normalize-tags';

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
  showModal: boolean = false;
  selectedPost: Blog | null = null;
  private readonly baseUrl: string = 'http://127.0.0.1:8000'; // Base URL for images

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.loadBlogs(this.currentPage);
  }

  /**
   * Load blogs for the specified page from the API
   * @param page The page number to load
   */
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
          content: post.content ?? 'No content available', // Ensure content is available
          featuredImage: post.featuredImage
            ? `${this.baseUrl}/${post.featuredImage.replace(/^\/+/, '')}`
            : 'assets/images/placeholder.jpg', // Fallback image
        }));
        this.currentPage = response.current_page;
        this.totalPages = response.last_page;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching blogs:', error);
        this.errorMessage =
          error.status === 404
            ? 'No articles found.'
            : 'Failed to load articles. Please try again later.';
        this.isLoading = false;
      },
    });
  }

  /**
   * Set the active category for filtering posts
   * @param category The category to filter by
   */
  setCategory(category: string): void {
    this.activeCategory = category;
    this.currentPage = 1; // Reset to first page when changing category
    this.loadBlogs(this.currentPage); // Reload blogs with new category (if API supports filtering)
  }

  /**
   * Like a post and update its state
   * @param postId The ID of the post to like
   * @param event The click event
   */
  likePost(postId: number, event: Event): void {
    event.stopPropagation();
    if (!postId) {
      console.warn('Invalid post ID for liking');
      return;
    }

    const post = this.posts.find((p) => p.id === postId);
    if (post && !post.liked) {
      // Call API to update likes (if available)
      // this.blogService.likePost(postId).subscribe({
      //   next: () => {
      //     post.likes = (post.likes || 0) + 1;
      //     post.liked = true;
      //     setTimeout(() => {
      //       post.liked = false; // Reset animation after 500ms
      //     }, 500);
      //   },
      //   error: (error) => {
      //     console.error('Error liking post:', error);
      //     this.errorMessage = 'Failed to like the post. Please try again.';
      //   },
      
    }
  }

  /**
   * Open the modal to display post details
   * @param post The blog post to display
   */
  openPostModal(post: Blog): void {
    if (!post) {
      console.warn('No post selected for modal');
      return;
    }
    this.selectedPost = { ...post }; // Create a copy to avoid unintended changes
    this.showModal = true;
  }

  /**
   * Close the modal and reset selected post
   */
  closePostModal(): void {
    this.showModal = false;
    this.selectedPost = null;
  }

  /**
   * Navigate to the next page
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadBlogs(this.currentPage);
    }
  }

  /**
   * Navigate to the previous page
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadBlogs(this.currentPage);
    }
  }
}