import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import useAlumnos from '../hooks/useAlumnos';
import useCourses from '../hooks/useCourses';
import useBimesters from '../hooks/useBimesters';
import { gradesStore } from '../lib/grades-store';
import { useAuth } from '../lib/auth-context';
import { 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  BookMarked,
  Send,
  Clock,
  FileCheck,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface SubjectTeacherDashboardProps {
  selectedBimester: string;
  onNavigate: (page: string) => void;
}

type SubmissionStatus = 'draft' | 'sending' | 'sent';

export function SubjectTeacherDashboard({ selectedBimester, onNavigate }: SubjectTeacherDashboardProps) {
  const { user } = useAuth();
  const { alumnos = [], loading: alumnosLoading } = useAlumnos();
  const { courses: allCourses = [], loading: coursesLoading } = useCourses();
  const { bimesters = [], loading: bimestersLoading } = useBimesters();
  const currentBimester = (bimesters || []).find(b => b.id === selectedBimester);

   const assignedSections = user?.assignedSections || [];
   const assignedCourses = user?.assignedCourses || [];

   const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('draft');
   const [grades, setGrades] = useState<Record<string, Record<string, number>>>({});

   const getSectionProgress = (section: string) => {
    const students = (alumnos || []).filter(s => s.section === section);
     const grades = gradesStore.getGrades({ 
       section, 
       bimester: selectedBimester 
     });
     
     const myCourseGrades = grades.filter(g => 
       assignedCourses.includes(g.courseId)
     );
     
     const totalPossible = students.length * assignedCourses.length;
     const completed = myCourseGrades.filter(g => g.value !== null).length;
     const coverage = totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0;
     
     const consolidation = gradesStore.getConsolidation(section, selectedBimester);
     
     return {
       students: students.length,
       completed,
       total: totalPossible,
       coverage,
       isClosed: consolidation?.isClosed || false
     };
   };

   const sectionProgress = assignedSections.map(section => ({
     section,
     ...getSectionProgress(section)
   }));

   const totalCoverage = Math.round(
     (sectionProgress.length ? sectionProgress.reduce((acc, s) => acc + s.coverage, 0) / sectionProgress.length : 0)
   );

   const totalCompleted = sectionProgress.reduce((acc, s) => acc + s.completed, 0);
   const totalPossible = sectionProgress.reduce((acc, s) => acc + s.total, 0);

  const myCourses = (allCourses || []).filter(c => assignedCourses.includes(c.id));

   // Get sample students for the simplified table
   const sampleSection = assignedSections[0] || '';
  const sampleStudents = (alumnos || []).filter(s => s.section === sampleSection).slice(0, 10);

   const handleGradeChange = (studentId: string, courseId: string, value: string) => {
     const numValue = parseFloat(value);
     if (value === '' || (numValue >= 0 && numValue <= 20)) {
       setGrades(prev => ({
         ...prev,
         [studentId]: {
           ...(prev[studentId] || {}),
           [courseId]: numValue
         }
       }));
       // Mark as draft when changes are made
       if (submissionStatus === 'sent') {
         setSubmissionStatus('draft');
       }
     }
   };

   const handleSubmitToTutor = () => {
     setSubmissionStatus('sending');
     
     // Simulate submission process
     setTimeout(() => {
       setSubmissionStatus('sent');
       toast.success('Notas enviadas al tutor exitosamente');
     }, 2000);
   };

   const getSubmissionBadge = () => {
     switch (submissionStatus) {
       case 'draft':
         return (
           <Badge variant="outline" className="text-gray-600 border-gray-400">
             <Clock className="h-3 w-3 mr-1" />
             Borrador
           </Badge>
         );
       case 'sending':
         return (
           <Badge className="bg-blue-100 text-blue-800 border-0">
             <div className="flex items-center gap-1">
               <div className="animate-spin h-3 w-3 border-2 border-blue-200 border-t-blue-600 rounded-full" />
               <span>Enviando...</span>
             </div>
           </Badge>
         );
       case 'sent':
         return (
           <Badge className="bg-green-100 text-green-800 border-0">
             <CheckCircle className="h-3 w-3 mr-1" />
             Enviado
           </Badge>
         );
     }
   };

   return (
     <div className="p-6 space-y-6">
       <div>
         <h1 className="text-2xl bg-gradient-to-r from-[#166534] to-[#ff8000] bg-clip-text text-transparent">
           Bienvenido/a de vuelta, Docente
         </h1>
         <p className="text-gray-800 mt-1 text-sm">
           Explore su espacio académico digital
          {(alumnosLoading || coursesLoading || bimestersLoading) && ' (Cargando...)'}
         </p>
       </div>

       {/* Stats Cards */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="border-2 border-[#ff8000] shadow-sm">
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm text-gray-600">Mis Secciones</CardTitle>
             <BookOpen className="h-5 w-5 text-green-700" />
           </CardHeader>
           <CardContent>
             <div className="text-3xl">{assignedSections.length}</div>
             <p className="text-xs text-gray-500 mt-1">
               secciones asignadas
             </p>
           </CardContent>
         </Card>

         <Card className="border-2 border-[#ff8000] shadow-sm">
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm text-gray-600">Cursos</CardTitle>
             <BookMarked className="h-5 w-5 text-green-700" />
           </CardHeader>
           <CardContent>
             <div className="text-3xl">{assignedCourses.length}</div>
             <p className="text-xs text-gray-500 mt-1">
               asignaturas a cargo
             </p>
           </CardContent>
         </Card>

         <Card className="border-2 border-[#ff8000] shadow-sm">
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm text-gray-600">Notas Registradas</CardTitle>
             <CheckCircle2 className="h-5 w-5 text-green-700" />
           </CardHeader>
           <CardContent>
            <div className="text-3xl">
              {alumnosLoading ? '—' : totalCompleted}
            </div>
             <p className="text-xs text-gray-500 mt-1">
               de {totalPossible} totales
             </p>
           </CardContent>
         </Card>

         <Card className="border-2 border-[#ff8000] shadow-sm">
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm text-gray-600">Progreso General</CardTitle>
             <TrendingUp className="h-5 w-5 text-green-700" />
           </CardHeader>
           <CardContent>
            <div className="text-3xl">
              {alumnosLoading || coursesLoading ? '—' : `${totalCoverage}%`}
            </div>
             <p className="text-xs text-gray-500 mt-1">
               cobertura total
             </p>
           </CardContent>
         </Card>
       </div>

       {/* Grade Entry Section */}
       <Card className="border-0 shadow-sm">
         <CardHeader>
           <div className="flex items-center justify-between">
             <div>
               <CardTitle>Registro Simplificado de Notas</CardTitle>
               <CardDescription>
                 Ingrese las notas para sus cursos asignados (escala 0-20)
               </CardDescription>
             </div>
             {getSubmissionBadge()}
           </div>
         </CardHeader>
         <CardContent>
          {alumnosLoading || coursesLoading ? (
            <p className="text-center text-gray-500 py-8">Cargando datos...</p>
          ) : (
           <div className="overflow-x-auto">
             <table className="w-full text-sm">
               <thead>
                 <tr className="border-b">
                   <th className="text-left p-3 bg-gray-50 sticky left-0">Estudiante</th>
                   {myCourses.slice(0, 4).map(course => (
                     <th key={course.id} className="text-center p-3 bg-gray-50 min-w-[100px]">
                       {course.name}
                     </th>
                   ))}
                 </tr>
               </thead>
               <tbody>
                 {sampleStudents.map(student => (
                   <tr key={student.id} className="border-b hover:bg-gray-50">
                     <td className="p-3 sticky left-0 bg-white font-medium">
                      {student.fullName || `${student.nombre || ''} ${student.apellido || ''}`}
                     </td>
                     {myCourses.slice(0, 4).map(course => (
                       <td key={course.id} className="p-3 text-center">
                         <Input
                           type="number"
                           step="0.01"
                           min="0"
                           max="20"
                           value={grades[student.id]?.[course.id] || ''}
                           onChange={(e) => handleGradeChange(student.id, course.id, e.target.value)}
                           disabled={submissionStatus === 'sending'}
                           className="w-20 text-center"
                           placeholder="0-20"
                         />
                       </td>
                     ))}
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
          )}
           
           <div className="mt-6 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
             <div className="text-sm text-gray-600">
               {submissionStatus === 'draft' && (
                 <span>Tiene cambios sin enviar. Haga clic en "Enviar al Tutor" para guardar.</span>
               )}
               {submissionStatus === 'sent' && (
                 <span className="text-green-700">
                   ✓ Las notas fueron enviadas exitosamente al tutor
                 </span>
               )}
               {submissionStatus === 'sending' && (
                 <span className="text-blue-700">Enviando notas al tutor...</span>
               )}
             </div>
             <Button
               onClick={handleSubmitToTutor}
               disabled={submissionStatus === 'sending' || submissionStatus === 'sent'}
               size="lg"
               className={submissionStatus === 'sent' ? 'bg-green-600' : ''}
             >
               {submissionStatus === 'sending' ? (
                 <>
                   <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                   Enviando...
                 </>
               ) : submissionStatus === 'sent' ? (
                 <>
                   <CheckCircle className="h-4 w-4 mr-2" />
                   Enviado
                 </>
               ) : (
                 <>
                   <Send className="h-4 w-4 mr-2" />
                   Enviar al Tutor
                 </>
               )}
             </Button>
           </div>

           <div className="mt-4 text-xs text-gray-500 text-center">
             Mostrando {sampleStudents.length} estudiantes de la sección {sampleSection}. 
             Para ver todos, vaya a <button onClick={() => onNavigate('grades')} className="text-green-700 underline">Registro de Notas</button>
           </div>
         </CardContent>
       </Card>

       {/* Timeline Visual */}
       <Card className="border-0 shadow-sm">
         <CardHeader>
           <CardTitle>Flujo de Envío y Validación</CardTitle>
           <CardDescription>
             Seguimiento del proceso de registro y aprobación de notas
           </CardDescription>
         </CardHeader>
         <CardContent>
           <div className="relative">
             {/* Timeline line */}
             <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
             
             {/* Timeline items */}
             <div className="space-y-8">
               {/* Step 1 */}
               <div className="relative flex items-start gap-6">
                 <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                   submissionStatus === 'draft' || submissionStatus === 'sending' || submissionStatus === 'sent'
                     ? 'bg-green-600'
                     : 'bg-gray-300'
                 }`}>
                   <CheckCircle2 className="h-6 w-6 text-white" />
                 </div>
                 <div className="flex-1 pt-2">
                   <h3 className="font-medium">Registro de Notas</h3>
                   <p className="text-sm text-gray-600 mt-1">
                     Ingreso de calificaciones en el sistema
                   </p>
                   <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-300">
                     Completado
                   </Badge>
                 </div>
               </div>

               {/* Step 2 */}
               <div className="relative flex items-start gap-6">
                 <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                   submissionStatus === 'sending' || submissionStatus === 'sent'
                     ? 'bg-blue-600'
                     : submissionStatus === 'draft'
                     ? 'bg-[#ff8000]'
                     : 'bg-gray-300'
                 }`}>
                   {submissionStatus === 'sending' ? (
                     <div className="animate-spin h-6 w-6 border-3 border-white border-t-transparent rounded-full" />
                   ) : (
                     <Send className="h-6 w-6 text-white" />
                   )}
                 </div>
                 <div className="flex-1 pt-2">
                   <h3 className="font-medium">Envío al Tutor</h3>
                   <p className="text-sm text-gray-600 mt-1">
                     Las notas son enviadas al tutor para validación
                   </p>
                   {submissionStatus === 'draft' && (
                     <Badge variant="outline" className="mt-2 bg-[#ffe6cc] text-[#ff8000] border-[#ff8000]">
                       Pendiente
                     </Badge>
                   )}
                   {submissionStatus === 'sending' && (
                     <Badge className="mt-2 bg-blue-100 text-blue-700 border-0">
                       En proceso...
                     </Badge>
                   )}
                   {submissionStatus === 'sent' && (
                     <Badge className="mt-2 bg-green-50 text-green-700 border-green-300">
                       Enviado
                     </Badge>
                   )}
                 </div>
               </div>

               {/* Step 3 */}
               <div className="relative flex items-start gap-6">
                 <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                   submissionStatus === 'sent'
                     ? 'bg-[#ff8000]'
                     : 'bg-gray-300'
                 }`}>
                   <FileCheck className="h-6 w-6 text-white" />
                 </div>
                 <div className="flex-1 pt-2">
                   <h3 className="font-medium">Validación del Tutor</h3>
                   <p className="text-sm text-gray-600 mt-1">
                     El tutor revisa y valida las notas ingresadas
                   </p>
                   {submissionStatus === 'sent' ? (
                     <Badge variant="outline" className="mt-2 bg-[#ffe6cc] text-[#ff8000] border-[#ff8000]">
                       En revisión
                     </Badge>
                   ) : (
                     <Badge variant="outline" className="mt-2 text-gray-500 border-gray-300">
                       Pendiente
                     </Badge>
                   )}
                 </div>
               </div>

               {/* Step 4 */}
               <div className="relative flex items-start gap-6">
                 <div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center bg-gray-300">
                   <CheckCircle className="h-6 w-6 text-white" />
                 </div>
                 <div className="flex-1 pt-2">
                   <h3 className="font-medium">Consolidación Final</h3>
                   <p className="text-sm text-gray-600 mt-1">
                     El período es cerrado y las libretas son generadas
                   </p>
                   <Badge variant="outline" className="mt-2 text-gray-500 border-gray-300">
                     Pendiente
                   </Badge>
                 </div>
               </div>
             </div>
           </div>
         </CardContent>
       </Card>

       {/* My Courses */}
       <Card className="border-0 shadow-sm">
         <CardHeader>
           <CardTitle>Mis Asignaturas</CardTitle>
           <CardDescription>Seleccione su curso a cargo para registrar las notas correspondientes</CardDescription>
         </CardHeader>
         <CardContent>
          {coursesLoading || alumnosLoading ? (
            <p className="text-center text-gray-500 py-8">Cargando cursos...</p>
          ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {myCourses.map(course => {
               // Calculate course progress across all sections
              const courseGrades = assignedSections.flatMap(section => {
                const students = (alumnos || []).filter(s => s.section === section);
                 const grades = gradesStore.getGrades({
                   section,
                   bimester: selectedBimester,
                   courseId: course.id
                 });
                 return { total: students.length, completed: grades.filter(g => g.value !== null).length };
               });
               
               const totalStudents = courseGrades.reduce((acc, c) => acc + c.total, 0);
               const completedGrades = courseGrades.reduce((acc, c) => acc + c.completed, 0);
               const courseProgress = totalStudents > 0 ? Math.round((completedGrades / totalStudents) * 100) : 0;

               return (
                 <Card 
                   key={course.id}
                   className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-[#ff8000]"
                   onClick={() => onNavigate('grades')}
                 >
                   <CardHeader>
                     <div className="flex items-start gap-3">
                       <div className="p-2 bg-[#ffe6cc] rounded-lg">
                         <BookMarked className="h-5 w-5 text-[#ff8000]" />
                       </div>
                       <div className="flex-1">
                         <CardTitle className="text-base">{course.name}</CardTitle>
                       </div>
                     </div>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-3">
                       <div className="flex items-center justify-between text-sm">
                         <span className="text-gray-600">Progreso</span>
                         <Badge variant={courseProgress === 100 ? "default" : "outline"} className={courseProgress === 100 ? "bg-green-600" : ""}>
                           {courseProgress}%
                         </Badge>
                       </div>
                       <div className="w-full bg-gray-200 rounded-full h-2">
                         <div 
                           className={`h-2 rounded-full transition-all ${
                             courseProgress === 100 ? 'bg-green-600' : 'bg-[#ff8000]'
                           }`}
                           style={{ width: `${courseProgress}%` }}
                         />
                       </div>
                       <p className="text-xs text-gray-500">
                         {completedGrades}/{totalStudents} notas registradas
                       </p>
                       <Button className="w-full" size="sm" onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                         e.stopPropagation();
                         onNavigate('grades');
                       }}>
                         Registrar Notas
                       </Button>
                     </div>
                   </CardContent>
                 </Card>
               );
             })}
           </div>
          )}
         </CardContent>
       </Card>

       {/* Sections Progress */}
       <Card className="border-0 shadow-sm">
         <CardHeader>
           <CardTitle>Progreso por Sección</CardTitle>
           <CardDescription>
             Estado del registro de notas para {currentBimester?.name || 'Cargando...'}
           </CardDescription>
         </CardHeader>
         <CardContent>
          {alumnosLoading ? (
            <p className="text-center text-gray-500 py-8">Cargando secciones...</p>
          ) : (
           <div className="space-y-4">
             {sectionProgress.map(section => (
               <div 
                 key={section.section}
                 className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
               >
                 <div className="flex items-center justify-between mb-3">
                   <div>
                     <div className="flex items-center gap-3">
                       <h3 className="font-medium">Sección {section.section}</h3>
                       {section.isClosed ? (
                         <Badge className="bg-green-100 text-green-800">
                           <CheckCircle2 className="h-3 w-3 mr-1" />
                           Cerrado
                         </Badge>
                       ) : (
                         <Badge variant="outline" className="text-[#ff8000] border-[#ff8000]">
                           Abierto
                         </Badge>
                       )}
                     </div>
                     <p className="text-sm text-gray-600 mt-1">
                       {section.students} estudiantes • {section.completed}/{section.total} notas • {section.coverage}%
                     </p>
                   </div>
                   <Button 
                     onClick={() => onNavigate('grades')}
                     disabled={section.isClosed}
                   >
                     {section.isClosed ? 'Ver Notas' : 'Registrar Notas'}
                   </Button>
                 </div>
                 <div className="w-full bg-gray-200 rounded-full h-2">
                   <div 
                     className={`h-2 rounded-full transition-all ${
                       section.coverage === 100 ? 'bg-green-600' : 'bg-[#ff8000]'
                     }`}
                     style={{ width: `${section.coverage}%` }}
                   />
                 </div>
               </div>
             ))}
           </div>
          )}
         </CardContent>
       </Card>

       {/* Alerts */}
       {sectionProgress.some(s => !s.isClosed && s.coverage < 100) && (
         <Card className="border-[#ff8000] bg-[#ffe6cc]">
           <CardHeader>
             <div className="flex items-start gap-3">
               <AlertCircle className="h-5 w-5 text-[#ff8000] mt-0.5" />
               <div>
                 <CardTitle className="text-base text-[#cc6600]">
                   Recordatorio: Complete el Registro de Notas
                 </CardTitle>
                 <CardDescription className="text-[#994d00]">
                   Aún hay notas pendientes de registro. Complete todas las evaluaciones antes de que el tutor cierre el período.
                 </CardDescription>
                 <Button 
                   className="mt-3" 
                   size="sm"
                   onClick={() => onNavigate('grades')}
                 >
                   Ir a Registro de Notas
                 </Button>
               </div>
             </div>
           </CardHeader>
         </Card>
       )}

       {sectionProgress.every(s => s.isClosed) && (
         <Card className="border-gray-200 bg-gray-50">
           <CardHeader>
             <div className="flex items-start gap-3">
               <CheckCircle2 className="h-5 w-5 text-gray-600 mt-0.5" />
               <div>
                 <CardTitle className="text-base text-gray-900">
                   Período Cerrado
                 </CardTitle>
                 <CardDescription className="text-gray-700">
                  El {currentBimester?.name || 'período'} ha sido cerrado. Ya no es posible editar las notas. 
                   Si necesita hacer cambios, contacte al tutor de la sección.
                 </CardDescription>
               </div>
             </div>
           </CardHeader>
         </Card>
       )}
     </div>
   );
 }