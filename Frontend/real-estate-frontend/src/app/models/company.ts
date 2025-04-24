export interface Company {
    company_id: number;
    company_name: string;
    commercial_registration_number: string;
    company_email: string;
    company_phone_number: string;
    company_address: string;
    commercial_registration_doc: string | null;
    real_estate_license_doc: string | null;
    tax_card_doc: string | null;
    proof_of_address_doc: string | null;
    years_in_real_estate: number;
    company_website: string;
    date_of_establishment: string;
    accept_terms: boolean;
    has_used_trial: boolean;
    verification_status: string;
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
    logo: string | null;
}
