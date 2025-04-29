export interface Consultant {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    type: string;
    message: string | null;
    seen: boolean;
    created_at: string;
  }