// User and Authentication Types

export type UserRole = 'Admin' | 'Chapter Leader' | 'Committee Head' | 'Attendee';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  chapter_id: string | null;
  tribe_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface UserWithRelations extends User {
  chapter?: Chapter;
  tribe?: Tribe;
}

export interface Tribe {
  id: string;
  name: string;
  color: string | null;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

