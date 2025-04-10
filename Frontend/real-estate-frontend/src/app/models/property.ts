// src/app/models/property
export interface PropertyMedia {
  id: number;
  PropertyID: number;
  MediaURL: string;
  MediaType: string;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: number;
  title: string;
  slug: string;
  description: string;
  type: string;
  price: string;
  commission: string | null;
  city: string;
  district: string;
  full_address: string;
  area: number;
  bedrooms: number | null;
  bathrooms: number | null;
  listing_type: string;
  construction_status: string;
  approval_status: string;
  transaction_status: string;
  building_year: string;
  legal_status: string;
  furnished: boolean;
  amenities: string;
  payment_options: string;
  cover_image: string;
  property_code: string;
  media?: PropertyMedia[]; // أضفنا هذا الحقل هنا
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface PropertyApiResponse {
  data: Property[];
  current_page: number;
  last_page: number;
}
