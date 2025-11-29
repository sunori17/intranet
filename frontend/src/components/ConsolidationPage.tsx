import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import useAlumnos from '../hooks/useAlumnos';
import useCourses from '../hooks/useCourses';
import useGrades from '../hooks/useGrades';import { useAuth } from '../lib/auth-context';
import { toast } from 'sonner';
import { Lock, Unlock, FileText, AlertCircle } from 'lucide-react';

interface ConsolidationPageProps {
  selectedBimester: string;
}

export function ConsolidationPage({ selectedBimester }: ConsolidationPageProps) {
  const { user } = useAuth();
  const { alumnos = [], loading: alumnosLoading } = useAlumnos();
  const { courses: allCourses = [], loading: coursesLoading } = useCourses();
  const { grades = {}, loading: gradesLoading } = useGrades(selectedBimester);
  const [isClosed, setIsClosed] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  const tutorSection = user?.assignedSections?.[0] || '';
  const students = (alumnos || []).filter(s => s.section === tutorSection);

  const getStudentGrades = (studentId: string) => {
    return (allCourses || []).map(course => ({
      courseId: course.id,
      courseName: course.name,
      grade: grades[`${studentId}-${course.id}`] || null
    }));
  };

  const handleClosePeriod = () => {
    setIsClosed(true);
    setShowCloseDialog(false);
    toast.success('Período cerrado exitosamente');
  };

  const handleGenerateReportCards = () => {
    toast.success('Generando libretas bimestrales...');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Consolidado de Notas</h1>
          <p className="text-gray-600 mt-1">
            Sección {tutorSection} - Visualice y gestione todas las notas enviadas por los profesores
            {alumnosLoading || coursesLoading || gradesLoading && ' (Cargando...)'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isClosed ? (
            <Badge className="bg-gray-600">
              <Lock className="h-3 w-3 mr-1" />
              Período Cerrado
            </Badge>
          ) : (
            <Badge className="bg-green-600">
              <Unlock className="h-3 w-3 mr-1" />
              Período Abierto
            </Badge>
          )}
        </div>
      </div>

      {!isClosed && (
        <Alert className="border-[#ff8000] bg-[#ffe6cc]">
          <AlertCircle className="h-4 w-4 text-[#ff8000]" />
          <AlertDescription className="text-[#994d00]">
            Revise todas las notas antes de cerrar el período. Una vez cerrado, no se podrán realizar modificaciones.
          </AlertDescription>
        </Alert>
      )}

      {/* Consolidated Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tabla Consolidada de Calificaciones</CardTitle>
          <CardDescription>
            Todas las notas enviadas por los profesores para el {selectedBimester}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alumnosLoading || coursesLoading || gradesLoading ? (
            <p className="text-center text-gray-500">Cargando datos...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 bg-gray-50 sticky left-0 z-10">Estudiante</th>
                    {(allCourses || []).slice(0, 8).map(course => (
                      <th key={course.id} className="text-center p-3 bg-gray-50 min-w-[100px]">
                        {course.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => {
                    const grades = getStudentGrades(student.id);
                    
                    return (
                      <tr key={student.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 sticky left-0 bg-white z-10 font-medium">
                          {student.nombre} {student.apellido}
                        </td>
                        {(allCourses || []).slice(0, 8).map(course => {
                          const grade = grades.find(g => g.courseId === course.id)?.grade;
                          return (
                            <td key={course.id} className="text-center p-3">
                              <span className={`px-2 py-1 rounded ${
                                grade === null || grade === undefined ? 'bg-gray-100 text-gray-600' :
                                grade >= 14 ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {grade ?? '—'}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones de Gestión</CardTitle>
          <CardDescription>
            Administre el estado del período y genere documentos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {!isClosed ? (
              <Button 
                onClick={() => setShowCloseDialog(true)}
                className="bg-[#ff8000] hover:bg-[#cc6600]"
              >
                <Lock className="h-4 w-4 mr-2" />
                Cerrar Período
              </Button>
            ) : (
              <Button 
                onClick={handleGenerateReportCards}
                className="bg-green-600 hover:bg-green-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generar Libretas Bimestrales
              </Button>
            )}
          </div>

          <p className="text-sm text-gray-600">
            {!isClosed 
              ? 'Una vez cerrado el período, se habilitará la opción de generar libretas oficiales.'
              : 'El período está cerrado. Ya puede generar las libretas bimestrales oficiales.'
            }
          </p>
        </CardContent>
      </Card>

      {/* Close Period Confirmation Dialog */}
      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Cerrar el período?</DialogTitle>
            <DialogDescription>
              Esta acción cerrará el período actual y no permitirá más modificaciones en las notas.
            </DialogDescription>
          </DialogHeader>
          <Alert className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Una vez cerrado, los profesores no podrán editar las notas. Asegúrese de haber revisado toda la información.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseDialog(false)}>
              No, cancelar
            </Button>
            <Button onClick={handleClosePeriod} className="bg-[#ff8000] hover:bg-[#cc6600]">
              <Lock className="h-4 w-4 mr-2" />
              Sí, cerrar período
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}