export interface PropertyMedia {
  id: number;
  PropertyID: number;
  MediaURL: string;
  MediaType: 'image' | 'video';
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: number;
  title: string;
  slug: string;
  description: string;
  type: 'land' | 'apartment' | 'villa' | 'office';
  price: number;
  commission?: number | null; // Optional to avoid errors if not returned
  city: string;
  district: string;
  full_address?: string | null;
  area: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  listing_type: 'for_sale' | 'for_rent';
  construction_status: 'available' | 'under_construction';
  approval_status?: 'pending' | 'accepted' | 'rejected' | null;
  transaction_status?: 'pending' | 'completed' | null;
  building_year?: number | null;
  legal_status?: 'licensed' | 'unlicensed' | 'pending' | null;
  furnished?: boolean | null;
  amenities?: string[] | null;
  payment_options?: string[] | null;
  cover_image?: string | null;
  property_code: string;
  media?: PropertyMedia[]; // Optional to avoid errors if not loaded
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface PropertyApiResponse {
  data: Property[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export interface Pagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  per_page: number;
}

export interface PropertySearchResponse {
  data: Property[];
  pagination: Pagination;
}

export interface PropertySearchErrorResponse {
  status: 'error';
  message: string;
  data?: never;
  pagination?: Pagination;
}

export type PropertySearchApiResponse =
  | PropertySearchResponse
  | PropertySearchErrorResponse;

  export interface PropertyFilters {
    [key: string]: string | number | boolean | undefined;
    keyword?: string;
    type?: string;
    city?: string;
    listing_type?: 'for_sale' | 'for_rent' | '';
    page?: number;
    sort_by?: string;
    min_price: number; // مش optional دلوقتي
    max_price: number; // مش optional دلوقتي
    min_area: number; // مش optional دلوقتي
    max_area: number; // مش optional دلوقتي
    bedrooms?: number | '';
    bathrooms?: number | '';
    is_new_building?: boolean;
  }
