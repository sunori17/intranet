// Mock data for Academic Intranet - IEP Cristo Redentor de Nocheto

export interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: 'principal' | 'tutor' | 'subject_teacher';
  email: string;
  assignedSections?: string[];
  assignedCourses?: string[];
}

export interface Student {
  id: string;
  fullName: string;
  section: string;
  enrollmentNumber: string;
}

export interface Course {
  id: string;
  name: string;
  groupedUnder?: string;
  order: number;
}

export interface Grade {
  studentId: string;
  courseId: string;
  section: string;
  bimester: string;
  month?: string;
  value: number | null;
  teacherId: string;
}

export interface Consolidation {
  section: string;
  bimester: string;
  isClosed: boolean;
  closedBy?: string;
  closedAt?: string;
}

export const BIMESTERS = [
  { 
    id: 'bim1', 
    name: 'Bimestre I', 
    months: 'Marzo - Abril',
    monthsList: ['Marzo', 'Abril']
  },
  { 
    id: 'bim2', 
    name: 'Bimestre II', 
    months: 'Mayo - Junio - Julio',
    monthsList: ['Mayo', 'Junio', 'Julio']
  },
  { 
    id: 'bim3', 
    name: 'Bimestre III', 
    months: 'Agosto - Septiembre',
    monthsList: ['Agosto', 'Septiembre']
  },
  { 
    id: 'bim4', 
    name: 'Bimestre IV', 
    months: 'Octubre - Noviembre - Diciembre',
    monthsList: ['Octubre', 'Noviembre', 'Diciembre']
  }
];

export const COURSES: Course[] = [
  // Matemática group
  { id: 'aritmetica', name: 'Aritmética', groupedUnder: 'Matemática', order: 1 },
  { id: 'algebra', name: 'Álgebra', groupedUnder: 'Matemática', order: 2 },
  { id: 'geometria', name: 'Geometría', groupedUnder: 'Matemática', order: 3 },
  { id: 'razonamiento_mat', name: 'Razonamiento Matemático', groupedUnder: 'Matemática', order: 4 },
  
  // Comunicación Integral group
  { id: 'gramatica', name: 'Gramática', groupedUnder: 'Comunicación Integral', order: 5 },
  { id: 'ortografia', name: 'Ortografía', groupedUnder: 'Comunicación Integral', order: 6 },
  { id: 'comprension_lectora', name: 'Comprensión Lectora', groupedUnder: 'Comunicación Integral', order: 7 },
  { id: 'razonamiento_verbal', name: 'Razonamiento Verbal', groupedUnder: 'Comunicación Integral', order: 8 },
  
  // Ciencia, Tecnología y Ambiente group
  { id: 'biologia', name: 'Biología', groupedUnder: 'Ciencia, Tecnología y Ambiente', order: 9 },
  { id: 'fisica', name: 'Física', groupedUnder: 'Ciencia, Tecnología y Ambiente', order: 10 },
  
  // Personal Social group
  { id: 'historia', name: 'Historia', groupedUnder: 'Personal Social', order: 11 },
  { id: 'geografia', name: 'Geografía', groupedUnder: 'Personal Social', order: 12 },
  
  // Individual courses
  { id: 'edu_fisica', name: 'Educación Física', order: 13 },
  { id: 'edu_arte', name: 'Educación por el Arte', order: 14 },
  { id: 'edu_religiosa', name: 'Educación Religiosa', order: 15 },
  { id: 'ingles', name: 'Inglés', order: 16 },
  { id: 'computacion', name: 'Computación', order: 17 }
];

export const GROUPED_COURSES = [
  'Matemática',
  'Comunicación Integral',
  'Ciencia, Tecnología y Ambiente',
  'Personal Social',
  'Educación Física',
  'Educación por el Arte',
  'Educación Religiosa',
  'Inglés',
  'Computación'
];

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    username: 'director',
    password: '123456',
    fullName: 'Directora María Sánchez Torres',
    role: 'principal',
    email: 'directora@iepcristoredentor.edu.pe'
  },
  {
    id: 'u2',
    username: 'tutor1a',
    password: '123456',
    fullName: 'Prof. María García Ramos',
    role: 'tutor',
    email: 'mgarcia@iepcristoredentor.edu.pe',
    assignedSections: ['1°A']
  },
  {
    id: 'u3',
    username: 'tutor2b',
    password: '123456',
    fullName: 'Prof. José Luis Pérez Torres',
    role: 'tutor',
    email: 'jperez@iepcristoredentor.edu.pe',
    assignedSections: ['2°B']
  },
  {
    id: 'u4',
    username: 'profesor1',
    password: '123456',
    fullName: 'Prof. Ana Rodríguez Vega',
    role: 'subject_teacher',
    email: 'arodriguez@iepcristoredentor.edu.pe',
    assignedSections: ['1°A', '2°B'],
    assignedCourses: ['aritmetica', 'algebra', 'geometria', 'razonamiento_mat']
  },
  {
    id: 'u5',
    username: 'profesor2',
    password: '123456',
    fullName: 'Prof. Roberto Castillo Mendoza',
    role: 'subject_teacher',
    email: 'rcastillo@iepcristoredentor.edu.pe',
    assignedSections: ['1°A', '2°B'],
    assignedCourses: ['aritmetica', 'algebra', 'geometria', 'razonamiento_mat', 'gramatica', 'ortografia', 'comprension_lectora', 'razonamiento_verbal', 'biologia', 'fisica', 'historia', 'geografia', 'edu_fisica', 'edu_arte', 'edu_religiosa', 'ingles', 'computacion']
  }
];

export const MOCK_STUDENTS: Student[] = [
  // 1°A - 13 students
  { id: 's1', fullName: 'Álvarez Gómez, Diego Alonso', section: '1°A', enrollmentNumber: '2024001' },
  { id: 's2', fullName: 'Benítez Rojas, María Fernanda', section: '1°A', enrollmentNumber: '2024002' },
  { id: 's3', fullName: 'Castro Pérez, Luis Miguel', section: '1°A', enrollmentNumber: '2024003' },
  { id: 's4', fullName: 'Díaz Salazar, Carmen Rosa', section: '1°A', enrollmentNumber: '2024004' },
  { id: 's5', fullName: 'Espinoza Torres, Jorge Alberto', section: '1°A', enrollmentNumber: '2024005' },
  { id: 's6', fullName: 'Flores Mendoza, Valentina Sofia', section: '1°A', enrollmentNumber: '2024006' },
  { id: 's7', fullName: 'García Ruiz, Sebastián Andres', section: '1°A', enrollmentNumber: '2024007' },
  { id: 's8', fullName: 'Huamán Quispe, Lucía Isabel', section: '1°A', enrollmentNumber: '2024008' },
  { id: 's9', fullName: 'Jiménez Vargas, Pablo Enrique', section: '1°A', enrollmentNumber: '2024009' },
  { id: 's10', fullName: 'López Morales, Sofía Alejandra', section: '1°A', enrollmentNumber: '2024010' },
  { id: 's11', fullName: 'Martínez Silva, Rodrigo Antonio', section: '1°A', enrollmentNumber: '2024011' },
  { id: 's12', fullName: 'Navarro Campos, Isabella Gabriela', section: '1°A', enrollmentNumber: '2024012' },
  { id: 's13', fullName: 'Ortega Ramírez, Mateo Javier', section: '1°A', enrollmentNumber: '2024013' },
  
  // 2°B - 13 students
  { id: 's14', fullName: 'Paredes León, Daniela Cristina', section: '2°B', enrollmentNumber: '2024014' },
  { id: 's15', fullName: 'Quispe Flores, Carlos Eduardo', section: '2°B', enrollmentNumber: '2024015' },
  { id: 's16', fullName: 'Ramírez Santos, Adriana Paola', section: '2°B', enrollmentNumber: '2024016' },
  { id: 's17', fullName: 'Sánchez Gutiérrez, Fernando José', section: '2°B', enrollmentNumber: '2024017' },
  { id: 's18', fullName: 'Torres Vega, Camila Andrea', section: '2°B', enrollmentNumber: '2024018' },
  { id: 's19', fullName: 'Vargas Muñoz, Ángel Gabriel', section: '2°B', enrollmentNumber: '2024019' },
  { id: 's20', fullName: 'Villanueva Díaz, Valeria Milagros', section: '2°B', enrollmentNumber: '2024020' },
  { id: 's21', fullName: 'Yañez Cortez, Nicolás Alejandro', section: '2°B', enrollmentNumber: '2024021' },
  { id: 's22', fullName: 'Zamora Reyes, Fernanda Lucía', section: '2°B', enrollmentNumber: '2024022' },
  { id: 's23', fullName: 'Aguilar Montes, Santiago Rafael', section: '2°B', enrollmentNumber: '2024023' },
  { id: 's24', fullName: 'Bravo Chávez, Gabriela Sofía', section: '2°B', enrollmentNumber: '2024024' },
  { id: 's25', fullName: 'Carrillo Ponce, Matías Ignacio', section: '2°B', enrollmentNumber: '2024025' },
  { id: 's26', fullName: 'Delgado Herrera, Renata Victoria', section: '2°B', enrollmentNumber: '2024026' }
];

// Generate realistic grades (0-20 scale)
const generateGrade = (): number => {
  const random = Math.random();
  if (random < 0.05) return Math.floor(Math.random() * 5) + 6; // 5% low grades (6-10)
  if (random < 0.20) return Math.floor(Math.random() * 3) + 11; // 15% medium-low (11-13)
  if (random < 0.60) return Math.floor(Math.random() * 3) + 14; // 40% good (14-16)
  return Math.floor(Math.random() * 4) + 17; // 40% excellent (17-20)
};

export const MOCK_GRADES: Grade[] = [];

// Generate grades for all students, courses, and first 2 bimesters
MOCK_STUDENTS.forEach(student => {
  COURSES.forEach(course => {
    // First two bimesters have complete grades
    MOCK_GRADES.push({
      studentId: student.id,
      courseId: course.id,
      section: student.section,
      bimester: 'bim1',
      month: 'Marzo',
      value: generateGrade(),
      teacherId: 'u4'
    });
    
    MOCK_GRADES.push({
      studentId: student.id,
      courseId: course.id,
      section: student.section,
      bimester: 'bim2',
      month: 'Mayo',
      value: generateGrade(),
      teacherId: 'u4'
    });
    
    // Third bimester partially filled (80% complete)
    if (Math.random() < 0.8) {
      MOCK_GRADES.push({
        studentId: student.id,
        courseId: course.id,
        section: student.section,
        bimester: 'bim3',
        month: 'Agosto',
        value: generateGrade(),
        teacherId: 'u4'
      });
    }
  });
});

export const MOCK_CONSOLIDATIONS: Consolidation[] = [
  {
    section: '1°A',
    bimester: 'bim1',
    isClosed: true,
    closedBy: 'u2',
    closedAt: '2024-05-01T10:30:00'
  },
  {
    section: '2°B',
    bimester: 'bim1',
    isClosed: true,
    closedBy: 'u3',
    closedAt: '2024-05-01T11:00:00'
  },
  {
    section: '1°A',
    bimester: 'bim2',
    isClosed: true,
    closedBy: 'u2',
    closedAt: '2024-07-02T09:15:00'
  },
  {
    section: '2°B',
    bimester: 'bim2',
    isClosed: false
  }
];

export const LETTER_GRADES = {
  AD: { min: 18, max: 20, label: 'AD - Logro Destacado' },
  A: { min: 14, max: 17, label: 'A - Logro Esperado' },
  B: { min: 11, max: 13, label: 'B - En Proceso' },
  C: { min: 0, max: 10, label: 'C - En Inicio' }
};

export function getLetterGrade(numericGrade: number): 'AD' | 'A' | 'B' | 'C' {
  if (numericGrade >= 18) return 'AD';
  if (numericGrade >= 14) return 'A';
  if (numericGrade >= 11) return 'B';
  return 'C';
}

export function calculateGroupAverage(courseIds: string[], studentId: string, section: string, bimester: string, grades: Grade[]): number | null {
  const groupGrades = grades.filter(
    g => courseIds.includes(g.courseId) && 
         g.studentId === studentId && 
         g.section === section && 
         g.bimester === bimester &&
         g.value !== null
  );
  
  if (groupGrades.length === 0) return null;
  
  const sum = groupGrades.reduce((acc, g) => acc + (g.value || 0), 0);
  return Math.round((sum / groupGrades.length) * 10) / 10;
}

export const UGEL_CONCLUSIONS = [
  'El estudiante será promovido al grado superior',
  'El estudiante requiere recuperación pedagógica',
  'El estudiante permanecerá en el mismo grado',
  'El estudiante ha demostrado logro destacado',
  'El estudiante muestra avance satisfactorio'
];