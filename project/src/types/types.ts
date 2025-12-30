export interface IDonation {
  id: string; // UUID - Primary Key
  categories: string[];
  clothing_type: string[]; // Changed from clothing_types (Singular)
  comments?: string;
  condition: string;
  donated_by: string; // User ID (Supabase Auth UID)
  email: string;
  full_name: string;
  images?: string[];
  timestamp: string; // ISO Date String
  status: "available" | "taken" | "fulfilled"; // Updated ENUM
  requested_by?: string; // User ID of who requested it (Nullable)
  accepted_request_id?: string; // UUID of the accepted request (Nullable)
  request_id?: string; // UUID of the request this donation is fulfilling (Nullable)
}

export interface IRequest {
  id: string; // UUID - Primary Key
  full_name: string;
  age: string;
  gender: string;
  phone: string;
  email?: string; // Nullable field
  address: string;
  donations?: IDonation[]; // Updated: A request can receive multiple donation offers
  ration_card_number: string;
  ration_card_type: string;
  ration_card_photo: string; // URL of the uploaded photo
  clothing_type: string[]; // Changed from clothing_types (Singular)
  categories: string[];
  clothing_size: string;
  additional_info?: string; // Nullable field
  timestamp: string; // ISO Date String
  status: "open" | "fulfilled"; // Updated ENUM
  fulfilled_by?: string; // User ID who fulfilled this request (Nullable)
  requested_by: string; // User ID of the requester (Supabase Auth UID)
  donation_id?: string; // UUID of the donation fulfilling this request (Nullable)
}

// export interface IDonation {
//   id: string;
//   categories: string[];
//   clothing_types: string[];
//   comments: string;
//   condition: string;
//   donated_by: string;
//   email: string;
//   full_name: string;
//   images?: string[];
//   timestamp: string;
//   status: "available" | "accepted" | "closed";
//   accepted_by?: string;
//   requested_by?: string[];
//   requests_id?: string[]
// }

// export interface IRequest {
//   id: string; // UUID - Primary Key
//   full_name: string;
//   age: string;
//   gender: string;
//   phone: string;
//   email: string; // Nullable field
//   address: string;
//   donations?: IDonation;
//   ration_card_number: string;
//   ration_card_type: string;
//   ration_card_photo: string; // URL of the uploaded photo
//   clothing_types: string[]; // Stored as an array
//   categories: string[]; // Stored as an array
//   clothing_size: string;
//   additional_info?: string; // Nullable field
//   timestamp: string; // ISO Date String
//   status: "open" | "accepted" | "declined"; // Enum-like status
//   fulfilled_by?: string; // UUID of the user who fulfilled this request (optional)
//   requested_by: string; // UUID of the user who submitted the request
//   donation_id?: string; // UUID of related donation (optional)
// }
