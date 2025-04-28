import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../footer/footer.component";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: Date;
  featuredImage: string;
  tags: string[];
  category: 'Buying' | 'Selling' | 'Market Trends' | 'Interior Design';
  readTime: number;
  likes: number;
  comments: number;
  liked?: boolean;
}

@Component({
  selector: 'app-real-estate-blog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './real-estate-blog.component.html',
  styleUrls: ['./real-estate-blog.component.scss']
})
export class RealEstateBlogComponent implements OnInit {
  activeCategory: string = 'all';
  searchQuery: string = '';

  posts: BlogPost[] = [
    {
      id: 1,
      title: 'Top 5 Neighborhoods to Invest in for 2024',
      excerpt: 'Discover the most promising real estate markets this year',
      content: 'Full article content...',
      author: 'Michael Johnson',
      date: new Date(2024, 2, 15),
      featuredImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa',
      tags: ['investment', 'market trends'],
      category: 'Market Trends',
      readTime: 8,
      likes: 124,
      comments: 32,
      liked: false
    },
    {
      id: 2,
      title: 'Modern Interior Design Trends for Luxury Apartments',
      excerpt: 'Explore the latest design trends transforming luxury spaces',
      content: 'Full article content...',
      author: 'Sarah Williams',
      date: new Date(2024, 1, 28),
      featuredImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914',
      tags: ['interior design', 'luxury'],
      category: 'Interior Design',
      readTime: 6,
      likes: 89,
      comments: 14,
      liked: false
    },
  ];

  get filteredPosts() {
    let result = this.posts;
    
    if (this.activeCategory !== 'all') {
      result = result.filter(post => post.category === this.activeCategory);
    }
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(post => 
        post.title.toLowerCase().includes(query) || 
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return result;
  }

  constructor() { }

  ngOnInit(): void {
    // API call would go here in real implementation
  }

  setCategory(category: string) {
    this.activeCategory = category;
  }

  likePost(postId: number, event: Event) {
    event.stopPropagation();
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      post.likes++;
      post.liked = true;
      
      setTimeout(() => {
        post.liked = false;
      }, 500);
    }
  }
}