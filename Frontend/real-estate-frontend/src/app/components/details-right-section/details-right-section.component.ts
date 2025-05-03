import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogService } from '../../services/blog.service';
import { Blog } from '../../models/blog';
import { Observable, catchError, map } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-details-right-section',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './details-right-section.component.html',
  styleUrls: ['./details-right-section.component.css'],
})
export class DetailsRightSectionComponent implements OnInit {
  recentPosts$!: Observable<Blog[]>;

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.recentPosts$ = this.blogService.getBlogs(1).pipe(
      map((paginatedBlogs) => paginatedBlogs.blogs.slice(0, 3)), // Take first 3 posts
      catchError((error) => {
        console.error('Error fetching recent posts:', error);
        return [];
      })
    );
  }
}
