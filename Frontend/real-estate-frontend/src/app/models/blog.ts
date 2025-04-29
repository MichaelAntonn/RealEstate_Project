export interface Blog {
    id: number;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    created_at: string | Date;
    featuredImage: string;
    tags: string[] | string | null;
    category: 'Buying' | 'Selling' | 'Market Trends' | 'Interior Design';
    readTime: number;
    likes: number;
    comments: number;
    liked?: boolean;
  }

  export interface PaginatedBlogs {
    blogs: Blog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  }
