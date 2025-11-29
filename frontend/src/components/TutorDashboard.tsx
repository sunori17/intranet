import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import useAlumnos from '../hooks/useAlumnos';
import useCourses from '../hooks/useCourses';
import useBimesters from '../hooks/useBimesters';
import { gradesStore } from '../lib/grades-store';
import { useAuth } from '../lib/auth-context';
import { 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen,
  Lock,
  Unlock
} from 'lucide-react';

interface TutorDashboardProps {
  selectedBimester: string;
  onNavigate: (page: string) => void;
}

export function TutorDashboard({ selectedBimester, onNavigate }: TutorDashboardProps) {
  const { user } = useAuth();
  const { alumnos = [], loading: alumnosLoading } = useAlumnos();
  const { courses: allCourses = [], loading: coursesLoading } = useCourses();
  const { bimesters = [], loading: bimestersLoading } = useBimesters();
  
  const mySection = user?.assignedSections?.[0] || '';
  const students = (alumnos || []).filter(s => s.section === mySection);
  const grades = gradesStore.getGrades({ section: mySection, bimester: selectedBimester });
  const consolidation = gradesStore.getConsolidation(mySection, selectedBimester);

  // Calculate completion
  const totalPossibleGrades = students.length * (allCourses?.length || 0);
   const completedGrades = grades.filter(g => g.value !== null).length;
   const coverage = totalPossibleGrades > 0 
     ? Math.round((completedGrades / totalPossibleGrades) * 100)
     : 0;

   const missingGrades = totalPossibleGrades - completedGrades;
  const currentBimester = (bimesters || []).find(b => b.id === selectedBimester);

   return (
     <div className="p-6 space-y-6">
       <div>
         <h1 className="text-2xl bg-gradient-to-r from-[#166534] to-[#ff8000] bg-clip-text text-transparent">
           Bienvenido/a de vuelta, Tutor
         </h1>
         <p className="text-gray-800 mt-1 text-sm">
          Explore su espacio académico digital
          {(alumnosLoading || coursesLoading || bimestersLoading) && ' (Cargando...)'}
         </p>
       </div>

       {/* Stats Cards */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <Card className="border-2 border-[#ff8000] shadow-sm">
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm text-gray-600">Mis Estudiantes</CardTitle>
             <Users className="h-5 w-5 text-green-700" />
           </CardHeader>
           <CardContent>
            <div className="text-3xl">
              {alumnosLoading ? '—' : students.length}
            </div>
             <p className="text-xs text-gray-500 mt-1">
               en la sección {mySection}
             </p>
           </CardContent>
         </Card>

         <Card className="border-2 border-[#ff8000] shadow-sm">
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm text-gray-600">Cobertura</CardTitle>
             <BookOpen className="h-5 w-5 text-green-700" />
           </CardHeader>
           <CardContent>
            <div className="text-3xl">
              {alumnosLoading || coursesLoading ? '—' : `${coverage}%`}
            </div>
             <p className="text-xs text-gray-500 mt-1">
              {alumnosLoading || coursesLoading ? '—' : `${completedGrades}/${totalPossibleGrades} notas`}
             </p>
           </CardContent>
         </Card>

         <Card className="border-2 border-[#ff8000] shadow-sm">
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm text-gray-600">Notas Pendientes</CardTitle>
             <AlertCircle className="h-5 w-5 text-green-700" />
           </CardHeader>
           <CardContent>
            <div className="text-3xl">
              {alumnosLoading || coursesLoading ? '—' : missingGrades}
            </div>
             <p className="text-xs text-gray-500 mt-1">
              {alumnosLoading || coursesLoading ? '—' : (missingGrades === 0 ? 'Todo completo' : 'por registrar')}
             </p>
           </CardContent>
         </Card>

         <Card className="border-2 border-[#ff8000] shadow-sm">
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm text-gray-600">Estado del Período</CardTitle>
             {consolidation?.isClosed ? (
               <Lock className="h-5 w-5 text-green-700" />
             ) : (
               <Unlock className="h-5 w-5 text-green-700" />
             )}
           </CardHeader>
           <CardContent>
             {consolidation?.isClosed ? (
               <Badge className="bg-green-100 text-green-800 border-0">
                 <CheckCircle2 className="h-3 w-3 mr-1" />
                 Cerrado
               </Badge>
             ) : (
               <Badge className="bg-yellow-100 text-yellow-800 border-0">
                 <Unlock className="h-3 w-3 mr-1" />
                 Abierto
               </Badge>
             )}
             {consolidation?.closedAt && (
               <p className="text-xs text-gray-500 mt-2">
                Cerrado: {new Date(consolidation.closedAt).toLocaleDateString('es-ES')}
               </p>
             )}
            {bimestersLoading ? (
              <p className="text-xs text-gray-500 mt-2">Cargando período...</p>
            ) : currentBimester ? (
              <p className="text-xs text-gray-500 mt-2">
                Período: {currentBimester.name}
              </p>
            ) : null}
           </CardContent>
         </Card>
       </div>
     </div>
   );
 }