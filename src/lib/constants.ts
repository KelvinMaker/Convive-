
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

export const PREDEFINED_INCIDENT_DESCRIPTIONS: { value: string; label: string }[] = [
  { value: 'Conflicto entre estudiantes (discusiones, peleas verbales o físicas, burlas, apodos ofensivos, exclusión social)', label: 'Conflicto entre estudiantes (discusiones, peleas verbales o físicas, burlas, apodos ofensivos, exclusión social)' },
  { value: 'Acoso escolar o bullying (intimidación, amenazas, hostigamiento físico, verbal o digital (ciberacoso))', label: 'Acoso escolar o bullying (intimidación, amenazas, hostigamiento físico, verbal o digital (ciberacoso))' },
  { value: 'Faltas de respeto a docentes o personal escolar (respuestas groseras, desobediencia, interrupciones constantes en clase)', label: 'Faltas de respeto a docentes o personal escolar (respuestas groseras, desobediencia, interrupciones constantes en clase)' },
  { value: 'Vandalismo (daños a la infraestructura, pupitres, baños, paredes, materiales escolares)', label: 'Vandalismo (daños a la infraestructura, pupitres, baños, paredes, materiales escolares)' },
  { value: 'Robo o hurto (sustracción de objetos personales de compañeros o de la institución)', label: 'Robo o hurto (sustracción de objetos personales de compañeros o de la institución)' },
  { value: 'Discriminación (actitudes o comentarios por razones de género, raza, religión, orientación sexual, discapacidad)', label: 'Discriminación (actitudes o comentarios por razones de género, raza, religión, orientación sexual, discapacidad)' },
  { value: 'Consumo de sustancias (uso o porte de cigarrillos, alcohol o drogas dentro del colegio)', label: 'Consumo de sustancias (uso o porte de cigarrillos, alcohol o drogas dentro del colegio)' },
  { value: 'Fugas o ausencias injustificadas (salir del colegio sin permiso, faltar a clases sin justificación)', label: 'Fugas o ausencias injustificadas (salir del colegio sin permiso, faltar a clases sin justificación)' },
  { value: 'Desobediencia a normas institucionales (incumplimiento del reglamento, uso inadecuado del uniforme, portar objetos prohibidos)', label: 'Desobediencia a normas institucionales (incumplimiento del reglamento, uso inadecuado del uniforme, portar objetos prohibidos)' },
  { value: 'Acoso sexual o comentarios inapropiados (insinuaciones, tocamientos, gestos o palabras de connotación sexual)', label: 'Acoso sexual o comentarios inapropiados (insinuaciones, tocamientos, gestos o palabras de connotación sexual)' },
  { value: 'Uso inadecuado de dispositivos electrónicos (grabar, tomar fotos o difundir información sin consentimiento, distracción en clase)', label: 'Uso inadecuado de dispositivos electrónicos (grabar, tomar fotos o difundir información sin consentimiento, distracción en clase)' },
  { value: 'Participación en riñas o peleas (dentro o fuera del plantel, relacionadas con la convivencia escolar)', label: 'Participación en riñas o peleas (dentro o fuera del plantel, relacionadas con la convivencia escolar)' },
  { value: 'Amenazas o extorsión (exigir dinero u objetos a cambio de no causar daño)', label: 'Amenazas o extorsión (exigir dinero u objetos a cambio de no causar daño)' },
  { value: 'Difusión de rumores o calumnias (afectar la reputación de otros miembros de la comunidad educativa)', label: 'Difusión de rumores o calumnias (afectar la reputación de otros miembros de la comunidad educativa)' },
];


export const APP_NAME = 'Convive+';

