export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name?: string;
  bio?: string;
  city?: string;
  occupation?: string;
  date_of_birth?: string;
  gender?: string;
  relationship_status?: string;
  mode?: 'dating' | 'social' | 'friendship';
  is_active: boolean;
  is_complete: boolean;
  status_declared: boolean;
  identity_verified: boolean;
  document_reviewed: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  profile?: Profile;
}

export interface Conversation {
  id: string;
  match_id: string;
  created_at: string;
  last_message?: Message;
  other_profile?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface SafeDatePlan {
  id: string;
  user_id: string;
  venue_name: string;
  venue_address: string;
  date_time: string;
  trusted_contact_name: string;
  trusted_contact_phone: string;
  checkin_interval_minutes: number;
  is_active: boolean;
  last_checkin?: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  location: string;
  event_date: string;
  ticket_url?: string;
  image_url?: string;
  created_at: string;
}
