import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import useAlumnos from '../hooks/useAlumnos';
import useCourses from '../hooks/useCourses';
import useGrades from '../hooks/useGrades';
import { useAuth } from '../lib/auth-context';
import { toast } from 'sonner';
import { FileText, Download, Users } from 'lucide-react';

interface ReportCardsPageProps {
  selectedBimester: string;
}

export function ReportCardsPage({ selectedBimester }: ReportCardsPageProps) {
  const { user } = useAuth();
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');

  const { alumnos = [], loading: alumnosLoading } = useAlumnos();
  const { courses: allCourses = [], loading: coursesLoading } = useCourses();
  const { grades = {}, loading: gradesLoading } = useGrades(selectedBimester);

   const sections = user?.role === 'principal' 
     ? ['1A', '1B', '2A', '2B', '3A']
     : user?.assignedSections || [];

   const students = selectedSection
     ? (alumnos || []).filter(s => s.section === selectedSection)
     : [];

  const getStudentGrades = (studentId: string) => {
    return (allCourses || []).map(course => ({
      courseId: course.id,
      courseName: course.name,
      grade: grades[`${studentId}-${course.id}`] || null
    }));
  };

   const handleDownloadClassReport = () => {
     toast.success(`Descargando libreta de salón para ${selectedSection}`);
   };

   const handleDownloadStudentReport = () => {
     const student = students.find(s => s.id === selectedStudent);
     if (student) {
      toast.success(`Descargando libreta individual de ${student.fullName || `${student.nombre} ${student.apellido}`}`);
     }
   };

   return (
     <div className="p-6 space-y-6">
       <div>
         <h1>Libretas Bimestrales</h1>
         <p className="text-gray-600 mt-1">
          Visualice y descargue las libretas oficiales de notas
          {(alumnosLoading || coursesLoading || gradesLoading) && ' (Cargando...)'}
         </p>
       </div>

       <Card>
         <CardHeader>
           <CardTitle>Selección de Sección</CardTitle>
           <CardDescription>Seleccione la sección para visualizar las libretas</CardDescription>
         </CardHeader>
         <CardContent>
           <div className="space-y-2">
             <Label>Sección</Label>
            <Select value={selectedSection} onValueChange={setSelectedSection} disabled={alumnosLoading}>
               <SelectTrigger>
                <SelectValue placeholder={alumnosLoading ? "Cargando..." : "Seleccione una sección"} />
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
                 <CardTitle>Libreta de Salón - Sección {selectedSection}</CardTitle>
                 <CardDescription>
                   Vista consolidada de todos los estudiantes del salón
                 </CardDescription>
               </CardHeader>
               <CardContent>
                {alumnosLoading || coursesLoading || gradesLoading ? (
                  <p className="text-center text-gray-500 py-8">Cargando datos...</p>
                ) : (
                 <div className="overflow-x-auto mb-6">
                   <table className="w-full text-sm">
                     <thead>
                       <tr className="border-b">
                         <th className="text-left p-3 bg-gray-50 sticky left-0 z-10">Estudiante</th>
                        {(allCourses || []).slice(0, 6).map(course => (
                           <th key={course.id} className="text-center p-3 bg-gray-50 min-w-[80px]">
                             {course.name}
                           </th>
                         ))}
                       </tr>
                     </thead>
                     <tbody>
                       {students.map(student => {
                        const studentGrades = getStudentGrades(student.id);
                         
                         return (
                           <tr key={student.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium sticky left-0 bg-white z-10">
                              {student.fullName || `${student.nombre || ''} ${student.apellido || ''}`}
                            </td>
                            {studentGrades.slice(0, 6).map(({ courseId, grade }) => (
                               <td key={courseId} className="p-3 text-center">
                                {grade ? parseFloat(grade as unknown as string).toFixed(2) : '—'}
                               </td>
                             ))}
                           </tr>
                         );
                       })}
                     </tbody>
                   </table>
                 </div>
                )}

                 <Button onClick={handleDownloadClassReport} className="w-full md:w-auto" disabled={alumnosLoading || coursesLoading}>
                   <Download className="h-4 w-4 mr-2" />
                   Descargar Libreta de Salón (PDF)
                 </Button>
               </CardContent>
             </Card>
           </TabsContent>

           {/* Individual Student Report */}
           <TabsContent value="student" className="space-y-4">
             <Card>
               <CardHeader>
                 <CardTitle>Libreta Individual por Alumno</CardTitle>
                 <CardDescription>
                   Seleccione un estudiante para ver y descargar su libreta oficial
                 </CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="space-y-2">
                   <Label>Estudiante</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent} disabled={alumnosLoading}>
                     <SelectTrigger>
                      <SelectValue placeholder={alumnosLoading ? "Cargando..." : "Seleccione un estudiante"} />
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
                      {gradesLoading ? (
                        <p className="text-center text-gray-500 py-8">Cargando calificaciones...</p>
                      ) : (
                       <>
                        <h3 className="font-medium mb-4">
                          {students.find(s => s.id === selectedStudent)?.fullName || ''}
                         </h3>
                         <div className="space-y-2">
                          {(allCourses || []).slice(0, 10).map(course => {
                            const studentCourseGrade = grades[`${selectedStudent}-${course.id}`];
                             return (
                               <div key={course.id} className="flex items-center justify-between py-2 border-b">
                                 <span>{course.name}</span>
                                <span className="font-medium">
                                  {studentCourseGrade 
                                    ? parseFloat(studentCourseGrade as unknown as string).toFixed(2)
                                    : '—'}
                                </span>
                               </div>
                             );
                           })}
                         </div>
                       </>
                      )}
                     </div>

                    <Button 
                      onClick={handleDownloadStudentReport} 
                      className="w-full md:w-auto" 
                      disabled={gradesLoading}
                    >
                       <Download className="h-4 w-4 mr-2" />
                       Descargar Libreta Individual (PDF)
                     </Button>
                   </>
                 )}
               </CardContent>
             </Card>
           </TabsContent>
         </Tabs>
       )}
     </div>
   );
 }