// src/types/ticket.ts
export interface Ticket {
    id: string;
    requester_id: string;
    status: string;
    created_at: string;
    timestamp: string; // Added property
    full_name?: string;
    additional_info?: string;
  }


    