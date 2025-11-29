import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import useAlumnos from '../hooks/useAlumnos';
import useCourses from '../hooks/useCourses';
import useBimesters from '../hooks/useBimesters';
import { gradesStore } from '../lib/grades-store';
import { 
  Users, 
  BookOpen, 
  CheckCircle2, 
  FileText
} from 'lucide-react';

interface PrincipalDashboardProps {
  selectedBimester: string;
  onNavigate: (page: string) => void;
}

export function PrincipalDashboard({ selectedBimester, onNavigate }: PrincipalDashboardProps) {
  const { alumnos = [], loading: alumnosLoading } = useAlumnos();
  const { courses: allCourses = [], loading: coursesLoading } = useCourses();
  const { bimesters = [], loading: bimestersLoading } = useBimesters();
  const [stats, setStats] = useState({
    totalStudents: 0,
    sections: [] as string[],
    sectionStats: [] as Array<{ section: string; students: number; coverage: number; isClosed: boolean }>,
    overallCoverage: 0,
    closedSections: 0,
    activeSessions: 0,
    documentsGenerated: 0
  });

  useEffect(() => {
    if (!alumnosLoading && !coursesLoading && alumnos.length > 0 && allCourses.length > 0) {
      const uniqueSections = [...new Set(alumnos.map(s => s.section))];
      const totalStudents = alumnos.length;

      const sectionStatsData = uniqueSections.map(section => {
        const students = alumnos.filter(s => s.section === section);
        const grades = gradesStore.getGrades({ section, bimester: selectedBimester });
        const consolidation = gradesStore.getConsolidation(section, selectedBimester);
        
        const totalPossibleGrades = students.length * allCourses.length;
        const completedGrades = grades.filter(g => g.value !== null).length;
        const coverage = totalPossibleGrades > 0 
          ? Math.round((completedGrades / totalPossibleGrades) * 100)
          : 0;

        return {
          section,
          students: students.length,
          coverage,
          isClosed: consolidation?.isClosed || false
        };
      });

      const overallCoverage = sectionStatsData.length > 0
        ? Math.round(
            sectionStatsData.reduce((acc, s) => acc + s.coverage, 0) / sectionStatsData.length
          )
        : 0;

      const closedSections = sectionStatsData.filter(s => s.isClosed).length;
      const activeSessions = sectionStatsData.filter(s => !s.isClosed).length;
      const documentsGenerated = closedSections * 8 + 15;

      setStats({
        totalStudents,
        sections: uniqueSections,
        sectionStats: sectionStatsData,
        overallCoverage,
        closedSections,
        activeSessions,
        documentsGenerated
      });
    }
  }, [alumnos, allCourses, selectedBimester, alumnosLoading, coursesLoading]);

  const totalPolidocentes = 12; // TODO: fetch from backend /api/users/?role=subject_teacher

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl bg-gradient-to-r from-[#166534] to-[#ff8000] bg-clip-text text-transparent">
          Bienvenida de vuelta, Directora
        </h1>
        <p className="text-gray-800 mt-1 text-sm">
          Explore su espacio académico digital
          {(alumnosLoading || coursesLoading || bimestersLoading) && ' (Cargando...)'}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 border-[#ff8000] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Usuarios Activos</CardTitle>
            <Users className="h-5 w-5 text-green-700" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl">
              {alumnosLoading ? '—' : stats.totalStudents}
            </div>
             <p className="text-xs text-gray-500 mt-1">
              {stats.sections.length} secciones, {totalPolidocentes} polidocentes
             </p>
           </CardContent>
         </Card>

         <Card className="border-2 border-[#ff8000] shadow-sm">
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm text-gray-600">Sesiones Activas</CardTitle>
             <CheckCircle2 className="h-5 w-5 text-green-700" />
           </CardHeader>
           <CardContent>
            <div className="text-3xl">
              {alumnosLoading ? '—' : stats.activeSessions}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.activeSessions} abiertas, {stats.closedSections} cerradas
             </p>
           </CardContent>
         </Card>

         <Card className="border-2 border-[#ff8000] shadow-sm">
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm text-gray-600">Documentos Generados</CardTitle>
             <FileText className="h-5 w-5 text-green-700" />
           </CardHeader>
           <CardContent>
            <div className="text-3xl">
              {alumnosLoading ? '—' : stats.documentsGenerated}
            </div>
             <p className="text-xs text-gray-500 mt-1">
               Esta semana
             </p>
           </CardContent>
         </Card>

         <Card className="border-2 border-[#ff8000] shadow-sm">
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm text-gray-600">Cobertura de Notas</CardTitle>
             <BookOpen className="h-5 w-5 text-green-700" />
           </CardHeader>
           <CardContent>
            <div className="text-3xl">
              {alumnosLoading || coursesLoading ? '—' : `${stats.overallCoverage}%`}
            </div>
            <Progress 
              value={stats.overallCoverage} 
              className="mt-2" 
           />
           </CardContent>
         </Card>
       </div>
     </div>
   );
}