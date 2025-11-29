import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import useAlumnos from '../hooks/useAlumnos';
import useCourses from '../hooks/useCourses';
import useBimesters from '../hooks/useBimesters';
import { gradesStore } from '../lib/grades-store';
import { useAuth } from '../lib/auth-context';
import { History, CheckCircle2, Clock, FileText } from 'lucide-react';

interface HistoryPageProps {
  selectedBimester: string;
}

export function HistoryPage({ selectedBimester }: HistoryPageProps) {
  const { user } = useAuth();
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const { alumnos = [], loading: alumnosLoading } = useAlumnos();
  const { courses: allCourses = [], loading: coursesLoading } = useCourses();
  const { bimesters = [], loading: bimestersLoading } = useBimesters();

  const assignedSections = user?.assignedSections || [];
  const assignedCourses = user?.assignedCourses || [];
  const myCourses = (allCourses || []).filter(c => assignedCourses.includes(c.id));

  // Initialize defaults
  useEffect(() => {
    if (assignedSections.length > 0 && !selectedSection) {
      setSelectedSection(assignedSections[0]);
    }
    if (myCourses.length > 0 && !selectedCourse) {
      setSelectedCourse(myCourses[0].id);
    }
  }, [assignedSections, myCourses, selectedSection, selectedCourse]);

  const students = (alumnos || []).filter(s => s.section === selectedSection);

  // Get submission history for selected course and section
  const getSubmissionHistory = async () => {
    const history: Array<{
      date: string;
      bimester: string;
      month: string;
      studentsCount: number;
      status: 'sent' | 'accepted' | 'pending';
    }> = [];

    (bimesters || []).forEach(async bim => {
       const consolidation = gradesStore.getConsolidation(selectedSection, bim.id);
       const grades = gradesStore.getGrades({
         section: selectedSection,
         bimester: bim.id,
         courseId: selectedCourse
       });

       // Check if any grades were submitted
       const submittedGrades = (await grades).filter((g: any) => g.value !== null);
       
       if (submittedGrades.length > 0) {
        // Get submissions per month (bim may not have a 'months' property in the current type)
        const bimMonths = (bim as any).months ?? '';
        const months = bimMonths ? String(bimMonths).split(',').map((m: string) => m.trim()) : [];
        for (const month of months) {
           const monthGrades = (await grades).filter(g => g.month === month && g.value !== null);
           if (monthGrades.length > 0) {
             const consolidationResult = await consolidation;
             history.push({
               date: `${month} 2025`,
               bimester: bim.name,
               month: month,
               studentsCount: monthGrades.length,
               status: consolidationResult?.isClosed ? 'accepted' : 'sent'
             });
           }
         }
       }
     });

     return history.reverse(); // Most recent first
   };

   const [submissionHistory, setSubmissionHistory] = useState<Array<{
     date: string;
     bimester: string;
     month: string;
     studentsCount: number;
     status: 'sent' | 'accepted' | 'pending';
   }>>([]);

   useEffect(() => {
     const fetchSubmissionHistory = async () => {
       const history = await getSubmissionHistory();
       setSubmissionHistory(history);
     };
     fetchSubmissionHistory();
   }, [selectedSection, selectedCourse, bimesters]);
  const selectedCourseData = (allCourses || []).find(c => c.id === selectedCourse);

   return (
     <div className="p-6 space-y-6">
       <div>
         <h1>Historial de Envíos</h1>
         <p className="text-gray-600 mt-1">
          Revise el historial de envíos de notas al tutor
          {(alumnosLoading || coursesLoading || bimestersLoading) && ' (Cargando...)'}
         </p>
       </div>

       {/* Filters */}
       <Card>
         <CardHeader>
           <CardTitle className="text-base">Filtros</CardTitle>
           <CardDescription>
             Seleccione sección y curso para ver el historial de envíos
           </CardDescription>
         </CardHeader>
         <CardContent>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label>Sección</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection} disabled={alumnosLoading}>
                 <SelectTrigger>
                  <SelectValue placeholder={alumnosLoading ? "Cargando..." : "Seleccione sección"} />
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
              <Select value={selectedCourse} onValueChange={setSelectedCourse} disabled={coursesLoading}>
                 <SelectTrigger>
                  <SelectValue placeholder={coursesLoading ? "Cargando..." : "Seleccione curso"} />
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

       {/* History Timeline */}
       <Card>
         <CardHeader>
           <CardTitle>
             Historial: {selectedCourseData?.name} - Sección {selectedSection}
           </CardTitle>
           <CardDescription>
             Registro de envíos de notas realizados
           </CardDescription>
         </CardHeader>
         <CardContent>
          {alumnosLoading || coursesLoading || bimestersLoading ? (
            <p className="text-center text-gray-500 py-8">Cargando historial...</p>
          ) : (
           submissionHistory.length > 0 ? (
             <div className="space-y-4">
               {submissionHistory.map((item, index) => (
                 <div 
                   key={index}
                   className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                 >
                   <div className={`p-3 rounded-lg ${
                     item.status === 'accepted' ? 'bg-green-100' : 
                     item.status === 'sent' ? 'bg-blue-100' : 
                     'bg-orange-100'
                   }`}>
                     {item.status === 'accepted' ? (
                       <CheckCircle2 className={`h-6 w-6 text-green-700`} />
                     ) : item.status === 'sent' ? (
                       <FileText className={`h-6 w-6 text-blue-700`} />
                     ) : (
                       <Clock className={`h-6 w-6 text-orange-700`} />
                     )}
                   </div>
                   
                   <div className="flex-1">
                     <div className="flex items-center gap-3 mb-1">
                       <h3 className="font-medium">{item.month}</h3>
                       <Badge variant="outline" className="text-xs">
                         {item.bimester}
                       </Badge>
                       {item.status === 'accepted' ? (
                         <Badge className="bg-green-100 text-green-800 text-xs">
                           <CheckCircle2 className="h-3 w-3 mr-1" />
                           Aceptado por Tutor
                         </Badge>
                       ) : item.status === 'sent' ? (
                         <Badge className="bg-blue-100 text-blue-800 text-xs">
                           <FileText className="h-3 w-3 mr-1" />
                           Enviado
                         </Badge>
                       ) : (
                         <Badge className="bg-orange-100 text-orange-800 text-xs">
                           <Clock className="h-3 w-3 mr-1" />
                           Pendiente
                         </Badge>
                       )}
                     </div>
                     <p className="text-sm text-gray-600">
                       {item.studentsCount} estudiantes • Enviado en {item.date}
                     </p>
                     {item.status === 'accepted' && (
                       <p className="text-xs text-green-700 mt-1">
                         ✓ Consolidado y cerrado por el tutor
                       </p>
                     )}
                   </div>

                   <div className="text-right text-sm text-gray-500">
                     {item.date}
                   </div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center py-12 text-gray-500">
               <History className="h-16 w-16 mb-4 text-gray-400" />
               <p className="text-center">
                 No hay envíos registrados para este curso y sección
               </p>
               <p className="text-sm text-center mt-2">
                 Los envíos aparecerán aquí una vez que registre y guarde notas
               </p>
             </div>
           )
          )}
         </CardContent>
       </Card>
     </div>
   );
}