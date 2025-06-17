export type UserRole = 'estudiante' | 'docente' | 'directivo' | 'anonimo';

export type IncidentType = 'conflicto' | 'logro';

export interface Incident {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string
  type: IncidentType;
  isAnonymous: boolean;
  reportedBy: string; // User ID or 'anonimo'
  userId?: string; // ID of the user if not anonymous
  userName?: string; // Name of the user if not anonymous
  userRole?: UserRole; // Role of the user if not anonymous
  group?: string; // Group ID, optional
}

export interface User {
  id: string;
  name: string;
  email: string; // Not used for 'anonimo'
  role: UserRole;
  groups?: string[]; // List of group IDs the user belongs to
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: string[]; // User IDs
  creatorId: string; // User ID of the creator
}
