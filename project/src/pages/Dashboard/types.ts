export interface IDonation {
    id: string;
    donated_by: string;
    full_name: string;
    email: string;
    clothing_type: string[];
    categories: string[];
    condition: string;
    comments?: string;
    images?: string[];
    timestamp: string;
    status: string;
    requested_by?: string;
    accepted_request_id?: string;
    request_id?: string;
    donation_requests?: {
      id: string;
      requester_id: string;
      status: string;
      created_at: string;
      full_name?: string;
      additional_info?: string;
    }[];
  }
  
  export interface IRequest {
    id: string;
    requested_by: string;
    full_name: string;
    age?: number;
    gender?: string;
    phone: string;
    email: string;
    address?: string;
    ration_card_number?: string;
    ration_card_type?: string;
    ration_card_photo?: string;
    clothing_type?: string[];
    clothing_size?: string;
    categories?: string[];
    additional_info?: string;
    timestamp: string;
    status: string;
    donation_id?: string;
    fulfilled?: boolean;
    fulfilled_by?: string;
    donation_requests?: {
      donation_id: string;
      status: string;
    }[];
  }