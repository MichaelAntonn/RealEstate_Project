import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../../services/blog.service';
import { Blog, PaginatedBlogs } from '../../../models/blog';
import { ArrayPipe } from '../../../pipes/array.pipe';
import { normalizeTags } from '../../../utils/normalize-tags';
import Swal from 'sweetalert2';

interface NormalizedBlog extends Blog {
  tags: string[];
}

@Component({
  selector: 'app-admin-blog',
  standalone: true,
  imports: [CommonModule, FormsModule, ArrayPipe],
  templateUrl: './admin-blog.component.html',
  styleUrls: ['./admin-blog.component.css'],
})
export class AdminBlogComponent implements OnInit {
  blogs: NormalizedBlog[] = [];
  pagination: any = {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  };
  isLoading = false;
  showForm = false;
  selectedBlog: Blog | null = null;
  form: any = {
    title: '',
    excerpt: '',
    content: '',
    author: '',
    tags: [],
    category: '',
    readTime: 1,
    featuredImage: null,
  };
  tagInput = '';
  private readonly baseUrl: string = 'http://127.0.0.1:8000'; // Base URL for images

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.loadBlogs(1);
  }

  loadBlogs(page: number): void {
    this.isLoading = true;
    this.blogService.getBlogs(page).subscribe({
      next: (response) => {
        this.blogs = response.blogs.map((blog: Blog) => ({
          ...blog,
          tags: normalizeTags(blog.tags),
          featuredImage: blog.featuredImage
            ? `${this.baseUrl}/${blog.featuredImage.replace(/^\/+/, '')}`
            : 'assets/images/placeholder.jpg', // Fallback image
        })) as NormalizedBlog[];
        this.pagination = {
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total,
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching blogs:', error);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to load blogs. Please try again.',
          timer: 3000,
          showConfirmButton: false,
        });
      },
    });
  }

  openForm(blog: Blog | null = null): void {
    this.selectedBlog = blog;
    this.showForm = true;
    if (blog) {
      this.form = {
        title: blog.title,
        excerpt: blog.excerpt,
        content: blog.content,
        author: blog.author,
        tags: normalizeTags(blog.tags),
        category: blog.category,
        readTime: blog.readTime,
        featuredImage: null,
      };
      this.tagInput = this.form.tags.join(', ');
    } else {
      this.form = {
        title: '',
        excerpt: '',
        content: '',
        author: '',
        tags: [],
        category: '',
        readTime: 1,
        featuredImage: null,
      };
      this.tagInput = '';
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.selectedBlog = null;
    this.form = {
      title: '',
      excerpt: '',
      content: '',
      author: '',
      tags: [],
      category: '',
      readTime: 1,
      featuredImage: null,
    };
    this.tagInput = '';
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.form.featuredImage = event.target.files[0];
    }
  }

  addTags(): void {
    if (this.tagInput) {
      this.form.tags = this.tagInput
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag);
      this.tagInput = this.form.tags.join(', ');
    } else {
      this.form.tags = [];
    }
  }

  validateForm(): boolean {
    if (!this.form.title || this.form.title.length > 255) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Title',
        text: 'Title is required and must be less than 255 characters.',
        timer: 3000,
        showConfirmButton: false,
      });
      return false;
    }
    if (!this.form.excerpt || this.form.excerpt.length > 500) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Excerpt',
        text: 'Excerpt is required and must be less than 500 characters.',
        timer: 3000,
        showConfirmButton: false,
      });
      return false;
    }
    if (!this.form.content) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Content',
        text: 'Content is required.',
        timer: 3000,
        showConfirmButton: false,
      });
      return false;
    }
    if (!this.form.author) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Author',
        text: 'Author is required.',
        timer: 3000,
        showConfirmButton: false,
      });
      return false;
    }
    if (!this.form.category) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Category',
        text: 'Category is required.',
        timer: 3000,
        showConfirmButton: false,
      });
      return false;
    }
    if (!this.form.readTime || this.form.readTime < 1) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Read Time',
        text: 'Read time must be at least 1 minute.',
        timer: 3000,
        showConfirmButton: false,
      });
      return false;
    }
    if (!this.selectedBlog && !this.form.featuredImage) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Image',
        text: 'Featured image is required for new blogs.',
        timer: 3000,
        showConfirmButton: false,
      });
      return false;
    }
    return true;
  }

  submitForm(): void {
    if (!this.validateForm()) {
      return;
    }

    const formData = new FormData();
    formData.append('title', this.form.title);
    formData.append('excerpt', this.form.excerpt);
    formData.append('content', this.form.content);
    formData.append('author', this.form.author);
    formData.append('category', this.form.category);
    formData.append('readTime', this.form.readTime.toString());
    this.form.tags.forEach((tag: string, index: number) => {
      formData.append(`tags[${index}]`, tag);
    });
    if (this.form.featuredImage) {
      formData.append('featuredImage', this.form.featuredImage);
    }

    const action = this.selectedBlog
      ? this.blogService.updateBlog(this.selectedBlog.id, formData)
      : this.blogService.createBlog(formData);

    action.subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: this.selectedBlog ? 'Blog Updated' : 'Blog Created',
          timer: 1500,
          showConfirmButton: false,
        });
        this.closeForm();
        this.loadBlogs(this.pagination.current_page);
      },
      error: (error) => {
        console.error('Error saving blog:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.message || 'Failed to save blog. Please try again.',
          timer: 3000,
          showConfirmButton: false,
        });
      },
    });
  }

  deleteBlog(id: number, title: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete the blog "${title}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.blogService.deleteBlog(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Blog deleted successfully.',
              timer: 2000,
              showConfirmButton: false,
            });
            this.loadBlogs(this.pagination.current_page);
          },
          error: (error) => {
            console.error('Error deleting blog:', error);
            Swal.fire({
              icon: 'error',
              title: 'Failed!',
              text: 'Failed to delete blog.',
              timer: 3000,
              showConfirmButton: false,
            });
          },
        });
      }
    });
  }

  goToPage(page: number): void {
    this.loadBlogs(page);
  }
}