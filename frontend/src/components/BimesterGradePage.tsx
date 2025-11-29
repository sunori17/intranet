import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import useAlumnos from '../hooks/useAlumnos';
import useCourses from '../hooks/useCourses';
import { useAuth } from '../lib/auth-context';
import { toast } from 'sonner';
import { Send, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface BimesterGradePageProps {
  selectedBimester: string;
}

interface BimesterGradeData {
  [studentId: string]: {
    monthlyAverage: number | null;
    bimesterExam: number | null;
  };
}

export function BimesterGradePage({ selectedBimester }: BimesterGradePageProps) {
  const { user } = useAuth();
  const { alumnos = [], loading: alumnosLoading } = useAlumnos();
  const { courses: allCourses = [], loading: coursesLoading } = useCourses();
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [gradeData, setGradeData] = useState<BimesterGradeData>({});
  const [submitted, setSubmitted] = useState(false);

  const assignedSections = user?.assignedSections || [];
  const assignedCourses = user?.assignedCourses || [];
  const myCourses = (allCourses || []).filter(c => assignedCourses.includes(c.id));
  
  const students = selectedSection
    ? (alumnos || []).filter(s => s.section === selectedSection)
    : [];

  // Simulated monthly averages from Registro de Notas
  const getMonthlyAverage = (studentId: string): number => {
    // This would come from saved data in real implementation
    const mockAverages: Record<string, number> = {
      's1': 15.5,
      's2': 17.2,
      's3': 14.8,
      's4': 16.3,
      's5': 13.9,
      's6': 18.1,
      's7': 15.7,
      's8': 16.9,
      's9': 14.2,
      's10': 17.5,
    };
    return mockAverages[studentId] || 0;
  };

  const handleExamGradeChange = (studentId: string, value: string) => {
    const numValue = parseFloat(value);
    if (value === '' || (numValue >= 0 && numValue <= 20)) {
      setGradeData(prev => ({
        ...prev,
        [studentId]: {
          monthlyAverage: getMonthlyAverage(studentId),
          bimesterExam: value === '' ? null : numValue
        }
      }));
    }
  };

  const calculateFinalAverage = (studentId: string): number | null => {
    const monthlyAvg = getMonthlyAverage(studentId);
    const examGrade = gradeData[studentId]?.bimesterExam;

    if (examGrade === null || examGrade === undefined) {
      return null;
    }

    // Average of monthly average and bimester exam
    return Math.round(((monthlyAvg + examGrade) / 2) * 100) / 100;
  };

  const handleSendToTutor = () => {
    // Check if all students have exam grades
    const incomplete = students.some(s => {
      const examGrade = gradeData[s.id]?.bimesterExam;
      return examGrade === null || examGrade === undefined;
    });

    if (incomplete) {
      toast.error('Complete todas las notas del examen bimestral antes de enviar');
      return;
    }

    setSubmitted(true);
    toast.success('Notas bimestrales enviadas al tutor exitosamente');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Nota Bimestral</h1>
        <p className="text-gray-600 mt-1">
          Registre las notas del examen bimestral y vea el promedio final
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Selección de Sección y Curso</CardTitle>
          <CardDescription>Seleccione la sección y el curso para registrar las notas bimestrales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sección</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una sección" />
                </SelectTrigger>
                <SelectContent>
                  {assignedSections.map(section => (
                    <SelectItem key={section} value={section}>
                      Sección {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Curso</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un curso" />
                </SelectTrigger>
                <SelectContent>
                  {myCourses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedSection && selectedCourse && (
        <>
          {submitted && (
            <Alert className="border-green-200 bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                ✓ Las notas bimestrales fueron enviadas al tutor exitosamente
              </AlertDescription>
            </Alert>
          )}

          {/* Bimester Grades Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Registro de Notas Bimestrales</CardTitle>
                  <CardDescription>
                    Los promedios actuales provienen del registro mensual. Ingrese las notas del examen bimestral.
                  </CardDescription>
                </div>
                {submitted && (
                  <Badge className="bg-green-600">
                    Enviado al Tutor
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 bg-gray-50 sticky left-0 z-10">Estudiante</th>
                      <th className="text-center p-3 bg-blue-50 min-w-[120px]">
                        Promedio Mensual
                        <br />
                        <span className="text-xs text-gray-500">(Del registro)</span>
                      </th>
                      <th className="text-center p-3 bg-[#ffe6cc] min-w-[150px]">
                        Examen Bimestral
                        <br />
                        <span className="text-xs text-gray-500">(Editable)</span>
                      </th>
                      <th className="text-center p-3 bg-green-50 font-medium min-w-[120px]">
                        Promedio Final
                        <br />
                        <span className="text-xs text-gray-500">(Automático)</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => {
                      const monthlyAvg = getMonthlyAverage(student.id);
                      const finalAvg = calculateFinalAverage(student.id);
                      
                      return (
                        <tr key={student.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 sticky left-0 bg-white z-10 font-medium">
                            {student.fullName}
                          </td>
                          <td className="p-3 text-center bg-blue-50">
                            <div className="font-medium text-blue-700">
                              {monthlyAvg.toFixed(2)}
                            </div>
                          </td>
                          <td className="p-3 text-center bg-[#ffe6cc]">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max="20"
                              value={gradeData[student.id]?.bimesterExam ?? ''}
                              onChange={(e) => handleExamGradeChange(student.id, e.target.value)}
                              className="w-24 text-center"
                              placeholder="0-20"
                              disabled={submitted}
                            />
                          </td>
                          <td className="p-3 text-center bg-green-50">
                            <div className="font-medium text-green-700">
                              {finalAvg !== null ? finalAvg.toFixed(2) : '-'}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {!submitted && (
                <div className="mt-6 flex items-center justify-end gap-3">
                  <Alert className="flex-1">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      El promedio final se calcula como el promedio entre el promedio mensual y el examen bimestral.
                    </AlertDescription>
                  </Alert>
                  <Button size="lg" onClick={handleSendToTutor}>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar al Tutor
                  </Button>
                </div>
              )}

              {submitted && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700">
                    ✓ Las notas han sido enviadas al tutor. Ya no es posible realizar cambios.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
