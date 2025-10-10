
export type UserRole = 'estudiante' | 'docente' | 'directivo' | 'anonimo';

export type IncidentType = 'conflicto' | 'logro';

export interface Incident {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string
  expiresAt: string; // ISO string
  type: IncidentType;
  isAnonymous: boolean;
  reportedBy: string; // User ID or 'anonimo'
  userId?: string; // ID of the user if not anonymous
  userName?: string; // Name of the user if not anonymous
  userRole?: UserRole; // Role of the user if not anonymous
  group?: string; // Group ID, optional
  status: 'open' | 'closed';
  closingObservation?: string;
  closedAt?: string; // ISO string
  closedBy?: string; // User ID
}

export interface User {
  id: string;
  name: string; // For admin setup, name might be derived or asked later. For now, email can serve as a stand-in.
  email: string;
  password?: string; // Plain text for prototype, should be hashed in production
  role: UserRole;
  groups?: string[]; // List of group IDs the user belongs to
  status?: 'pending' | 'active'; // For future invitation system
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: string[]; // User IDs
  creatorId: string; // User ID of the creator
}

// For future invitation system
export interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  invitedBy: string; // Admin User ID
  status: 'pending' | 'accepted' | 'expired';
  token: string; // Unique invitation token
  createdAt: string; // ISO Date string
  expiresAt: string; // ISO Date string
}

export interface TriviaResult {
  id: string;
  userId?: string;
  userName?: string;
  score: number;
  totalQuestions: number;
  playedAt: string; // ISO date string
}
