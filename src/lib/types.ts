export interface Expertise {
  id: number;
  name: string;
}

export interface Astrologer {
  id: number;
  name: string;
  email: string;
  bio: string;
  experience: string;
  language: string;
  location: string;
  register_date: string;
  expertise: string;
  profile_image: string | null;
}

export interface AstrologerApiResponse {
  status: string;
  total: number;
  data: Astrologer[];
}

export interface Booking {
  booking_id: number;
  client_name: string;
  client_email: string;
  phone_number: string;
  address: string;
  session_book_date: string;
  session_book_time: string;
  booking_datetime: string;
  astrologer_id: number;
  astrologer_name: string;
  astrologer_email: string;
  expertise_id: number;
  booking_status?: 'pending' | 'accepted' | 'cancelled';
  remarks: string | null;
}

export interface BookingApiResponse {
  bookings: Booking[];
}

export interface CallRequest {
  id: number;
  name: string;
  phone: string;
  note: string;
  status: string;
  remark: string;
  call_request_date: string;
  status_updated_at: string;
}

export interface CallRequestApiResponse {
  message: string;
  data: CallRequest[];
}
