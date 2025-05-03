<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Review;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        // Review 1: Property review for Luxury Villa in Cairo (PROP001)
        Review::create([
            'user_id' => 5,
            'property_id' => 1, // PROP001
            'review_type' => 'property',
            'rating' => 5,
            'comment' => 'Absolutely stunning villa with great amenities!',
            'anonymous_review' => false,
            'review_date' => '2025-04-01 09:00:00', // Full datetime
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Review 2: Agent review for Downtown Apartment (PROP002)
        Review::create([
            'user_id' => 6,
            'property_id' => 2, // PROP002
            'review_type' => 'agent',
            'rating' => 4,
            'comment' => 'The agent was very helpful and responsive.',
            'anonymous_review' => false,
            'review_date' => '2025-04-03 14:30:00',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Review 3: Location review for Beachfront Land (PROP003)
        Review::create([
            'user_id' => 7,
            'property_id' => 3, // PROP003
            'review_type' => 'location',
            'rating' => 3,
            'comment' => 'Great beach access, but a bit remote.',
            'anonymous_review' => true,
            'review_date' => '2025-04-05 11:15:00',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Review 4: Property review for Office in Giza (PROP004)
        Review::create([
            'user_id' => 8,
            'property_id' => 4, // PROP004
            'review_type' => 'property',
            'rating' => 5,
            'comment' => 'Perfect office space for my business.',
            'anonymous_review' => false,
            'review_date' => '2025-04-07 16:00:00',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Review 5: Agent review for Apartment in Zamalek (PROP005)
        Review::create([
            'user_id' => 7,
            'property_id' => 5, // PROP005
            'review_type' => 'agent',
            'rating' => 2,
            'comment' => 'Agent was slow to respond.',
            'anonymous_review' => true,
            'review_date' => '2025-04-09 13:45:00',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Review 6: Location review for Villa in Maadi (PROP006)
        Review::create([
            'user_id' => 7,
            'property_id' => 6, // PROP006
            'review_type' => 'location',
            'rating' => 4,
            'comment' => 'Quiet and green area, love it!',
            'anonymous_review' => false,
            'review_date' => '2025-04-10 10:30:00',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Review 7: Property review for Apartment in Heliopolis (PROP007)
        Review::create([
            'user_id' => 5,
            'property_id' => 7, // PROP007
            'review_type' => 'property',
            'rating' => 3,
            'comment' => 'Nice view, but still under construction.',
            'anonymous_review' => false,
            'review_date' => '2025-04-12 15:00:00',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Review 8: Agent review for Land in Sharm (PROP008)
        Review::create([
            'user_id' => 4,
            'property_id' => 8, // PROP008
            'review_type' => 'agent',
            'rating' => 5,
            'comment' => 'Agent provided excellent guidance.',
            'anonymous_review' => false,
            'review_date' => '2025-04-14 09:15:00',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Review 9: Location review for Apartment in 6th October (PROP009)
        Review::create([
            'user_id' => 5,
            'property_id' => 9, // PROP009
            'review_type' => 'location',
            'rating' => 4,
            'comment' => 'Convenient location, close to amenities.',
            'anonymous_review' => true,
            'review_date' => '2025-04-16 12:00:00',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Review 10: Property review for Villa in El Gouna (PROP010)
        Review::create([
            'user_id' => 4,
            'property_id' => 10, // PROP010
            'review_type' => 'property',
            'rating' => 5,
            'comment' => 'Luxury at its best, worth every penny!',
            'anonymous_review' => false,
            'review_date' => '2025-04-18 17:00:00',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Review 11: Agent review for Land in Madinaty (PROP011)
        Review::create([
            'user_id' => 5,
            'property_id' => 11, // PROP011
            'review_type' => 'agent',
            'rating' => 3,
            'comment' => 'Agent was okay, could improve communication.',
            'anonymous_review' => false,
            'review_date' => '2025-04-20 10:45:00',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Review 12: Location review for Apartment in Mansoura (PROP012)
        Review::create([
            'user_id' => 6,
            'property_id' => 12, // PROP012
            'review_type' => 'location',
            'rating' => 2,
            'comment' => 'Too noisy near the university.',
            'anonymous_review' => true,
            'review_date' => '2025-04-22 14:00:00',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Review 13: Property review for Villa in Ain Sokhna (PROP013)
        Review::create([
            'user_id' => 4,
            'property_id' => 13, // PROP013
            'review_type' => 'property',
            'rating' => 4,
            'comment' => 'Great sea view, but small area.',
            'anonymous_review' => false,
            'review_date' => '2025-04-24 11:30:00',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Review 14: Agent review for Apartment in Hurghada (PROP014)
        Review::create([
            'user_id' => 5,
            'property_id' => 14, // PROP014
            'review_type' => 'agent',
            'rating' => 1,
            'comment' => 'Agent was unprofessional.',
            'anonymous_review' => true,
            'review_date' => '2025-04-26 13:00:00',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Review 15: Location review for Villa in Luxor (PROP015)
        Review::create([
            'user_id' => 7,
            'property_id' => 15, // PROP015
            'review_type' => 'location',
            'rating' => 5,
            'comment' => 'Perfect spot near the Nile!',
            'anonymous_review' => false,
            'review_date' => '2025-04-28 16:15:00',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Review 16: Property review for PROP001 (repeat property)
        Review::create([
            'user_id' => 8,
            'property_id' => 1, // PROP001
            'review_type' => 'property',
            'rating' => 4,
            'comment' => 'Spacious but pricey.',
            'anonymous_review' => false,
            'review_date' => '2025-04-02 10:00:00',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Review 17: Agent review for PROP004 (repeat property)
        Review::create([
            'user_id' => 7,
            'property_id' => 4, // PROP004
            'review_type' => 'agent',
            'rating' => 5,
            'comment' => 'Fantastic service from the agent!',
            'anonymous_review' => false,
            'review_date' => '2025-04-08 15:30:00',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Review 18: Location review for PROP007 (repeat property)
        Review::create([
            'user_id' => 4,
            'property_id' => 7, // PROP007
            'review_type' => 'location',
            'rating' => 3,
            'comment' => 'Good area, but traffic can be bad.',
            'anonymous_review' => true,
            'review_date' => '2025-04-13 09:45:00',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Review 19: Property review for PROP010 (repeat property)
        Review::create([
            'user_id' => 5,
            'property_id' => 10, // PROP010
            'review_type' => 'property',
            'rating' => 5,
            'comment' => 'A dream villa, highly recommend!',
            'anonymous_review' => false,
            'review_date' => '2025-04-19 14:00:00',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Review 20: Agent review for PROP013 (repeat property)
        Review::create([
            'user_id' => 7,
            'property_id' => 13, // PROP013
            'review_type' => 'agent',
            'rating' => 4,
            'comment' => 'Agent was knowledgeable about the area.',
            'anonymous_review' => false,
            'review_date' => '2025-04-25 12:00:00',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}