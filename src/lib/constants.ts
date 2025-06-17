import type { UserRole, IncidentType } from './types';

export const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: 'estudiante', label: 'Estudiante' },
  { value: 'docente', label: 'Docente' },
  { value: 'directivo', label: 'Directivo' },
  { value: 'anonimo', label: 'Anónimo' }, // For selection in forms if applicable
];

export const INCIDENT_TYPES: { value: IncidentType; label: string }[] = [
  { value: 'conflicto', label: 'Conflicto' },
  { value: 'logro', label: 'Logro' },
];

export const APP_NAME = 'Convive+';
