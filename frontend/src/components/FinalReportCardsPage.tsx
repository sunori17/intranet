import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import useAlumnos from '../hooks/useAlumnos';
import useCourses from '../hooks/useCourses';
import useBimesters from '../hooks/useBimesters';
import { useAuth } from '../lib/auth-context';
import { toast } from 'sonner';
import { FileText, Download, Users, Lock, AlertCircle } from 'lucide-react';

export function FinalReportCardsPage() {
  const { user } = useAuth();
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [isClosed, setIsClosed] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  const { alumnos = [], loading: alumnosLoading } = useAlumnos();
  const { courses: allCourses = [], loading: coursesLoading } = useCourses();
  const { bimesters = [], loading: bimestersLoading } = useBimesters();
  const isTutor = user?.role === 'tutor';
  const isPrincipal = user?.role === 'principal';

  const sections = isPrincipal 
    ? ['1A', '1B', '2A', '2B', '3A']
    : user?.assignedSections || [];

  const students = selectedSection
    ? (alumnos || []).filter(s => s.section === selectedSection)
    : [];

  const handleClosePeriod = () => {
    setIsClosed(true);
    setShowCloseDialog(false);
    toast.success('Período final cerrado exitosamente');
  };

  const handleDownloadClassReport = () => {
    toast.success(`Descargando libreta final de salón para ${selectedSection}`);
  };

  const handleDownloadStudentReport = () => {
    const student = students.find(s => s.id === selectedStudent);
    if (student) {
      toast.success(`Descargando libreta final de ${student.fullName || student.nombre}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Libretas Finales</h1>
          <p className="text-gray-600 mt-1">
            Consolidado anual - Promedios de todos los bimestres
            {(alumnosLoading || coursesLoading || bimestersLoading) && ' (Cargando...)'}
          </p>
        </div>
        {isTutor && (
          <div className="flex items-center gap-3">
            {isClosed ? (
              <Badge className="bg-gray-600">
                <Lock className="h-3 w-3 mr-1" />
                Cerrado
              </Badge>
            ) : (
              <Badge className="bg-green-600">
                Abierto
              </Badge>
            )}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selección de Sección</CardTitle>
          <CardDescription>Seleccione la sección para visualizar las libretas finales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Sección</Label>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una sección" />
              </SelectTrigger>
              <SelectContent>
                {sections.map(section => (
                  <SelectItem key={section} value={section}>
                    Sección {section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedSection && (
        <Tabs defaultValue="class" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="class">
              <Users className="h-4 w-4 mr-2" />
              Libreta de Salón
            </TabsTrigger>
            <TabsTrigger value="student">
              <FileText className="h-4 w-4 mr-2" />
              Libreta por Alumno
            </TabsTrigger>
          </TabsList>

          {/* Class Report */}
          <TabsContent value="class" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Libreta Final - Sección {selectedSection}</CardTitle>
                <CardDescription>
                  Promedios bimestrales y promedio final del año académico
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 bg-gray-50 sticky left-0 z-10">Estudiante</th>
                        { (bimesters || []).map(bim => (
                          <th key={bim.id} className="text-center p-3 bg-gray-50 min-w-[80px]">
                            {bim.name}
                          </th>
                        ))}
                        <th className="text-center p-3 bg-green-50 font-medium">
                          Promedio Final
                        </th>
                      </tr>
                    </thead>
                    <tbody>

                      {students.map(student => {
                        const bimesterGrades = (bimesters || []).map(() => 
                          (Math.random() * 6 + 14).toFixed(2)
                        );
                        const finalAverage = (
                          bimesterGrades.reduce((sum, g) => sum + parseFloat(g), 0) / 
                          bimesterGrades.length
                        ).toFixed(2);

                        return (
                          <tr key={student.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 sticky left-0 bg-white z-10 font-medium">
                              {student.fullName || `${student.nombre || ''} ${student.apellido || ''}`}
                            </td>
                            {bimesterGrades.map((grade, idx) => (
                              <td key={idx} className="p-3 text-center">
                                {grade}
                              </td>
                            ))}
                            <td className="p-3 text-center bg-green-50 font-medium text-green-700">
                              {finalAverage}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center gap-3">
                  <Button onClick={handleDownloadClassReport} className="flex-1 md:flex-none">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Libreta de Salón (PDF)
                  </Button>

                  {isTutor && !isClosed && (
                    <Button 
                      onClick={() => setShowCloseDialog(true)}
                      className="bg-[#ff8000] hover:bg-[#cc6600]"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Cerrar Período Final
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Individual Student Report */}
          <TabsContent value="student" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Libreta Final por Alumno</CardTitle>
                <CardDescription>
                  Reporte individual con todos los promedios bimestrales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Estudiante</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un estudiante" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.fullName || `${student.nombre || ''} ${student.apellido || ''}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedStudent && (
                  <>
                    <div className="border rounded-lg p-6 bg-gray-50">
                      <h3 className="font-medium mb-4">
                        {students.find(s => s.id === selectedStudent)?.fullName || ''}
                      </h3>
                      
                      <div className="space-y-4">
                        {(allCourses || []).slice(0, 8).map(course => {
                          const bimesterGrades = (bimesters || []).map(() => 
                            (Math.random() * 6 + 14).toFixed(2)
                          );
                          const courseAverage = (
                            bimesterGrades.reduce((sum, g) => sum + parseFloat(g), 0) / 
                            bimesterGrades.length
                          ).toFixed(2);

                          return (
                            <div key={course.id} className="border-b pb-3">
                              <h4 className="font-medium mb-2">{course.name}</h4>
                              <div className="grid grid-cols-6 gap-2 text-sm">
                                {bimesters.map((bim, idx) => (
                                  <div key={bim.id} className="text-center">
                                    <div className="text-xs text-gray-600">{bim.name}</div>
                                    <div className="font-medium">{bimesterGrades[idx]}</div>
                                  </div>
                                ))}
                                <div className="text-center bg-green-100 rounded p-1">
                                  <div className="text-xs text-gray-600">Final</div>
                                  <div className="font-medium text-green-700">{courseAverage}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Button onClick={handleDownloadStudentReport} className="w-full md:w-auto">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar Libreta Final Individual (PDF)
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Close Period Confirmation Dialog */}
      {isTutor && (
        <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Cerrar el período final?</DialogTitle>
              <DialogDescription>
                Esta acción cerrará definitivamente el año académico y no permitirá más modificaciones.
              </DialogDescription>
            </DialogHeader>
            <Alert className="my-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Una vez cerrado, no se podrán realizar cambios en las notas finales. Esta es la última etapa del proceso.
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCloseDialog(false)}>
                No, cancelar
              </Button>
              <Button onClick={handleClosePeriod} className="bg-[#ff8000] hover:bg-[#cc6600]">
                <Lock className="h-4 w-4 mr-2" />
                Sí, cerrar período final
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}