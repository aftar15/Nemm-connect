// Database Types - Generated from Supabase Schema
// This file will be auto-generated when connected to Supabase
// For now, we export the types from other files

export type { User, UserRole, Chapter, UserWithRelations, Tribe, AuthUser } from './user.types';
export type { 
  ScheduleEvent, 
  EventType, 
  Announcement, 
  EventRegistration, 
  Attendance,
  AttendanceWithUser 
} from './event.types';
export type { 
  TribeWithMembers, 
  TribeMember, 
  CompetitionEvent, 
  CompetitionCategory,
  BracketType,
  Match, 
  MatchStatus,
  MatchWithTribes 
} from './tribe.types';

