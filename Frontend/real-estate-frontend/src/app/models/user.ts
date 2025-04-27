export interface User {
    id?: number;
    first_name: string;
    last_name: string;
    email: string;
    provider_id?: string;
    provider?: string;
    profile_image?: string;
    email_verified_at?: string;
    terms_and_conditions?: boolean;
    user_type?: string;
    account_status?: string;
    phone_number?: string;
    address?: string | null;
    country?: string | null;
    city?: string | null;
    identity_document?: string | null;
  }