<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BlogsSeeder extends Seeder
{
    public function run()
    {
        $blogs = [
            [
                'title' => 'Top 5 Real Estate Investment Areas in Egypt for 2025',
                'excerpt' => 'Explore the most promising areas in Egypt to invest in property for long-term gains.',
                'content' => 'Real estate in Egypt is booming, especially in New Capital, Sheikh Zayed, and New Cairo. This article explores the pros and cons of each...',
                'author' => 'Admin',
                'featuredImage' => 'blogs/investment-areas.jpg',
                'tags' => json_encode(['investment', 'egypt', 'real estate']),
                'category' => 'Real Estate',
                'readTime' => 6,
                'likes' => 45,
                'comments' => 8,
                'liked' => false,
            ],
            [
                'title' => 'How to Design a Modern Living Room in 2025',
                'excerpt' => 'Learn the latest trends in living room design that blend comfort with elegance.',
                'content' => 'Modern living rooms today are about minimalism, neutral colors, and functional furniture...',
                'author' => 'Dina Mahmoud',
                'featuredImage' => 'blogs/living-room-design.jpg',
                'tags' => json_encode(['design', 'interior', 'living room']),
                'category' => 'Interior Design',
                'readTime' => 4,
                'likes' => 32,
                'comments' => 5,
                'liked' => true,
            ],
            [
                'title' => 'Benefits of Hiring a Property Consultant',
                'excerpt' => 'Discover why hiring a consultant can help save money and reduce risks in property deals.',
                'content' => 'A good property consultant not only advises but also negotiates better deals. They understand market value, legal pitfalls...',
                'author' => 'Yasser Fathy',
                'featuredImage' => 'blogs/consultant-benefits.jpg',
                'tags' => json_encode(['consulting', 'real estate', 'advice']),
                'category' => 'Consultation',
                'readTime' => 5,
                'likes' => 21,
                'comments' => 2,
                'liked' => false,
            ],
            [
                'title' => 'Interior Design Trends to Watch in Egypt',
                'excerpt' => 'Egyptian homes are adapting global design styles with a local touch.',
                'content' => 'From boho chic to smart lighting, homeowners in Egypt are shifting towards tech-integrated and culture-inspired aesthetics...',
                'author' => 'Salma Adel',
                'featuredImage' => 'blogs/egypt-design-trends.jpg',
                'tags' => json_encode(['egypt', 'trends', 'interior']),
                'category' => 'Interior Design',
                'readTime' => 7,
                'likes' => 60,
                'comments' => 11,
                'liked' => true,
            ],
            [
                'title' => 'Why the New Capital is the Future of Real Estate in Egypt',
                'excerpt' => 'The New Administrative Capital is attracting both investors and homebuyers alike.',
                'content' => 'With government offices relocating and massive infrastructure investments, the New Capital is set to be a major urban hub...',
                'author' => 'Mostafa El Sayed',
                'featuredImage' => 'blogs/new-capital.jpg',
                'tags' => json_encode(['new capital', 'development', 'investment']),
                'category' => 'Real Estate',
                'readTime' => 5,
                'likes' => 38,
                'comments' => 4,
                'liked' => false,
            ],
        ];

        DB::table('blogs')->insert($blogs);
    }
}
