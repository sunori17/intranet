import { Grade, MOCK_GRADES, Consolidation, MOCK_CONSOLIDATIONS } from './mock-data';

interface BimesterExam {
  studentId: string;
  courseId: string;
  section: string;
  bimester: string;
  examGrade: number | null;
  teacherId: string;
}

class GradesStore {
  private grades: Grade[];
  private consolidations: Consolidation[];
  private bimesterExams: BimesterExam[];

  constructor() {
    // Load from localStorage or use mock data
    const storedGrades = localStorage.getItem('academic_grades');
    const storedConsolidations = localStorage.getItem('academic_consolidations');
    const storedExams = localStorage.getItem('academic_bimester_exams');
    
    this.grades = storedGrades ? JSON.parse(storedGrades) : [...MOCK_GRADES];
    this.consolidations = storedConsolidations ? JSON.parse(storedConsolidations) : [...MOCK_CONSOLIDATIONS];
    this.bimesterExams = storedExams ? JSON.parse(storedExams) : [];
  }

  private save() {
    localStorage.setItem('academic_grades', JSON.stringify(this.grades));
    localStorage.setItem('academic_consolidations', JSON.stringify(this.consolidations));
    localStorage.setItem('academic_bimester_exams', JSON.stringify(this.bimesterExams));
  }

  getGrades(filters?: {
    section?: string;
    bimester?: string;
    courseId?: string;
    studentId?: string;
  }): Grade[] {
    let result = [...this.grades];

    if (filters?.section) {
      result = result.filter(g => g.section === filters.section);
    }
    if (filters?.bimester) {
      result = result.filter(g => g.bimester === filters.bimester);
    }
    if (filters?.courseId) {
      result = result.filter(g => g.courseId === filters.courseId);
    }
    if (filters?.studentId) {
      result = result.filter(g => g.studentId === filters.studentId);
    }

    return result;
  }

  updateGrade(
    studentId: string,
    courseId: string,
    section: string,
    bimester: string,
    value: number | null,
    teacherId: string,
    month?: string
  ): boolean {
    // Check if period is closed
    const consolidation = this.consolidations.find(
      c => c.section === section && c.bimester === bimester
    );
    
    if (consolidation?.isClosed) {
      return false; // Cannot edit closed period
    }

    const existingIndex = this.grades.findIndex(
      g => g.studentId === studentId && 
           g.courseId === courseId && 
           g.section === section && 
           g.bimester === bimester
    );

    if (existingIndex >= 0) {
      this.grades[existingIndex].value = value;
      this.grades[existingIndex].teacherId = teacherId;
      if (month) {
        this.grades[existingIndex].month = month;
      }
    } else {
      this.grades.push({
        studentId,
        courseId,
        section,
        bimester,
        month,
        value,
        teacherId
      });
    }

    this.save();
    return true;
  }

  getConsolidation(section: string, bimester: string): Consolidation | undefined {
    return this.consolidations.find(
      c => c.section === section && c.bimester === bimester
    );
  }

  closeConsolidation(section: string, bimester: string, userId: string): boolean {
    const index = this.consolidations.findIndex(
      c => c.section === section && c.bimester === bimester
    );

    if (index >= 0) {
      this.consolidations[index].isClosed = true;
      this.consolidations[index].closedBy = userId;
      this.consolidations[index].closedAt = new Date().toISOString();
    } else {
      this.consolidations.push({
        section,
        bimester,
        isClosed: true,
        closedBy: userId,
        closedAt: new Date().toISOString()
      });
    }

    this.save();
    return true;
  }

  reopenConsolidation(section: string, bimester: string): boolean {
    const index = this.consolidations.findIndex(
      c => c.section === section && c.bimester === bimester
    );

    if (index >= 0) {
      this.consolidations[index].isClosed = false;
      this.consolidations[index].closedBy = undefined;
      this.consolidations[index].closedAt = undefined;
      this.save();
      return true;
    }

    return false;
  }

  getAllConsolidations(): Consolidation[] {
    return [...this.consolidations];
  }

  // Bimester exam methods
  getBimesterExam(
    studentId: string,
    courseId: string,
    section: string,
    bimester: string
  ): BimesterExam | undefined {
    return this.bimesterExams.find(
      e => e.studentId === studentId &&
           e.courseId === courseId &&
           e.section === section &&
           e.bimester === bimester
    );
  }

  updateBimesterExam(
    studentId: string,
    courseId: string,
    section: string,
    bimester: string,
    examGrade: number | null,
    teacherId: string
  ): boolean {
    // Check if period is closed
    const consolidation = this.consolidations.find(
      c => c.section === section && c.bimester === bimester
    );
    
    if (consolidation?.isClosed) {
      return false; // Cannot edit closed period
    }

    const existingIndex = this.bimesterExams.findIndex(
      e => e.studentId === studentId &&
           e.courseId === courseId &&
           e.section === section &&
           e.bimester === bimester
    );

    if (existingIndex >= 0) {
      this.bimesterExams[existingIndex].examGrade = examGrade;
      this.bimesterExams[existingIndex].teacherId = teacherId;
    } else {
      this.bimesterExams.push({
        studentId,
        courseId,
        section,
        bimester,
        examGrade,
        teacherId
      });
    }

    this.save();
    return true;
  }

  getBimesterExams(filters?: {
    section?: string;
    bimester?: string;
    courseId?: string;
    studentId?: string;
  }): BimesterExam[] {
    let result = [...this.bimesterExams];

    if (filters?.section) {
      result = result.filter(e => e.section === filters.section);
    }
    if (filters?.bimester) {
      result = result.filter(e => e.bimester === filters.bimester);
    }
    if (filters?.courseId) {
      result = result.filter(e => e.courseId === filters.courseId);
    }
    if (filters?.studentId) {
      result = result.filter(e => e.studentId === filters.studentId);
    }

    return result;
  }
}

export const gradesStore = new GradesStore();