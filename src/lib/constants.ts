
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

// Old flat list - will be kept for reference or if needed elsewhere, but not used by the new form
export const PREDEFINED_INCIDENT_DESCRIPTIONS_FLAT: { value: string; label: string }[] = [
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

export interface SpecificIncident {
  value: string;
  label: string;
}

export interface HierarchicalIncidentCategory {
  categoryValue: string;
  categoryLabel: string;
  specificTypes: SpecificIncident[];
}

export const PREDEFINED_INCIDENTS_HIERARCHICAL: HierarchicalIncidentCategory[] = [
  {
    categoryValue: 'conflicto_estudiantes',
    categoryLabel: 'Conflicto entre estudiantes',
    specificTypes: [
      { value: 'Discusiones entre estudiantes', label: 'Discusiones' },
      { value: 'Peleas verbales o físicas entre estudiantes', label: 'Peleas verbales o físicas' },
      { value: 'Burlas entre estudiantes', label: 'Burlas' },
      { value: 'Apodos ofensivos entre estudiantes', label: 'Apodos ofensivos' },
      { value: 'Exclusión social entre estudiantes', label: 'Exclusión social' },
    ],
  },
  {
    categoryValue: 'acoso_bullying',
    categoryLabel: 'Acoso escolar o bullying',
    specificTypes: [
      { value: 'Intimidación', label: 'Intimidación' },
      { value: 'Amenazas', label: 'Amenazas' },
      { value: 'Hostigamiento físico', label: 'Hostigamiento físico' },
      { value: 'Hostigamiento verbal', label: 'Hostigamiento verbal' },
      { value: 'Hostigamiento digital (ciberacoso)', label: 'Hostigamiento digital (ciberacoso)' },
    ],
  },
  {
    categoryValue: 'faltas_respeto_personal',
    categoryLabel: 'Faltas de respeto a docentes o personal escolar',
    specificTypes: [
      { value: 'Respuestas groseras a personal', label: 'Respuestas groseras' },
      { value: 'Desobediencia a personal', label: 'Desobediencia' },
      { value: 'Interrupciones constantes en clase', label: 'Interrupciones constantes en clase' },
    ],
  },
  {
    categoryValue: 'vandalismo',
    categoryLabel: 'Vandalismo',
    specificTypes: [
      { value: 'Daños a la infraestructura', label: 'Daños a la infraestructura' },
      { value: 'Daños a pupitres', label: 'Daños a pupitres' },
      { value: 'Daños a baños', label: 'Daños a baños' },
      { value: 'Daños a paredes', label: 'Daños a paredes' },
      { value: 'Daños a materiales escolares', label: 'Daños a materiales escolares' },
    ],
  },
  {
    categoryValue: 'robo_hurto',
    categoryLabel: 'Robo o hurto',
    specificTypes: [
      { value: 'Sustracción de objetos personales de compañeros', label: 'Sustracción de objetos personales de compañeros' },
      { value: 'Sustracción de objetos de la institución', label: 'Sustracción de objetos de la institución' },
    ],
  },
  {
    categoryValue: 'discriminacion',
    categoryLabel: 'Discriminación',
    specificTypes: [
      { value: 'Discriminación por género', label: 'Por género' },
      { value: 'Discriminación por raza', label: 'Por raza' },
      { value: 'Discriminación por religión', label: 'Por religión' },
      { value: 'Discriminación por orientación sexual', label: 'Por orientación sexual' },
      { value: 'Discriminación por discapacidad', label: 'Por discapacidad' },
      { value: 'Actitudes o comentarios discriminatorios generales', label: 'Actitudes o comentarios discriminatorios generales' },
    ],
  },
  {
    categoryValue: 'consumo_sustancias',
    categoryLabel: 'Consumo de sustancias',
    specificTypes: [
      { value: 'Uso o porte de cigarrillos', label: 'Uso o porte de cigarrillos' },
      { value: 'Uso o porte de alcohol', label: 'Uso o porte de alcohol' },
      { value: 'Uso o porte de drogas', label: 'Uso o porte de drogas' },
    ],
  },
  {
    categoryValue: 'fugas_ausencias',
    categoryLabel: 'Fugas o ausencias injustificadas',
    specificTypes: [
      { value: 'Salir del colegio sin permiso', label: 'Salir del colegio sin permiso' },
      { value: 'Faltar a clases sin justificación', label: 'Faltar a clases sin justificación' },
    ],
  },
  {
    categoryValue: 'desobediencia_normas',
    categoryLabel: 'Desobediencia a normas institucionales',
    specificTypes: [
      { value: 'Incumplimiento del reglamento', label: 'Incumplimiento del reglamento' },
      { value: 'Uso inadecuado del uniforme', label: 'Uso inadecuado del uniforme' },
      { value: 'Portar objetos prohibidos', label: 'Portar objetos prohibidos' },
    ],
  },
  {
    categoryValue: 'acoso_sexual_comentarios',
    categoryLabel: 'Acoso sexual o comentarios inapropiados',
    specificTypes: [
      { value: 'Insinuaciones sexuales', label: 'Insinuaciones' },
      { value: 'Tocamientos inapropiados', label: 'Tocamientos' },
      { value: 'Gestos de connotación sexual', label: 'Gestos de connotación sexual' },
      { value: 'Palabras de connotación sexual', label: 'Palabras de connotación sexual' },
    ],
  },
  {
    categoryValue: 'uso_inadecuado_electronicos',
    categoryLabel: 'Uso inadecuado de dispositivos electrónicos',
    specificTypes: [
      { value: 'Grabar o tomar fotos sin consentimiento', label: 'Grabar o tomar fotos sin consentimiento' },
      { value: 'Difundir información sin consentimiento', label: 'Difundir información sin consentimiento' },
      { value: 'Distracción en clase por dispositivos', label: 'Distracción en clase por dispositivos' },
    ],
  },
  {
    categoryValue: 'participacion_rinas',
    categoryLabel: 'Participación en riñas o peleas',
    specificTypes: [
      { value: 'Riñas dentro del plantel', label: 'Dentro del plantel' },
      { value: 'Riñas fuera del plantel (relacionadas con convivencia escolar)', label: 'Fuera del plantel (relacionadas con convivencia)' },
    ],
  },
  {
    categoryValue: 'amenazas_extorsion',
    categoryLabel: 'Amenazas o extorsión',
    specificTypes: [
      { value: 'Exigir dinero a cambio de no causar daño', label: 'Exigir dinero a cambio de no causar daño' },
      { value: 'Exigir objetos a cambio de no causar daño', label: 'Exigir objetos a cambio de no causar daño' },
    ],
  },
  {
    categoryValue: 'difusion_rumores',
    categoryLabel: 'Difusión de rumores o calumnias',
    specificTypes: [
      { value: 'Afectar la reputación de otros con rumores', label: 'Afectar la reputación de otros' },
    ],
  },
];


export const APP_NAME = 'Convive+';
