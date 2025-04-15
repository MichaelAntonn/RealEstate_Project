// models/property.model.ts
export interface Property {
  id?: number;
  title: string;
  slug: string;
  description: string;
  type: 'land' | 'apartment' | 'villa' | 'office';
  price: number;
  city: string;
  district: string;
  full_address?: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  listing_type: 'for_sale' | 'for_rent';
  construction_status: 'available' | 'under_construction';
  transaction_status?: 'pending' | 'completed';
  approval_status?: 'pending' | 'accepted' | 'rejected';
  building_year?: number;
  legal_status?: 'licensed' | 'unlicensed' | 'pending';
  furnished?: boolean;
  amenities?: string[];
  payment_options?: string[];
  cover_image?: string;
  property_code: string;
  user_id?: number;
  media?: PropertyMedia[];
  location?: string;
  status?: string;
  image?: string;
 
}

export interface PropertyMedia {
  id?: number;
  PropertyID?: number;
  MediaURL: string;
  MediaType: 'image' | 'video';
}
