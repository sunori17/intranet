import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import useAlumnos from '../hooks/useAlumnos';
import useCourses from '../hooks/useCourses';
import useBimesters from '../hooks/useBimesters';
import useUsers from '../hooks/useUsers';
import { gradesStore } from '../lib/grades-store';
import { 
  BookOpen, 
  CheckCircle2, 
  FileText,
  Clock,
  TrendingUp,
  AlertCircle,
  User
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ReportsPageProps {
  selectedBimester: string;
}

export function ReportsPage({ selectedBimester }: ReportsPageProps) {
  const { alumnos = [], loading: alumnosLoading } = useAlumnos();
  const { courses: allCourses = [], loading: coursesLoading } = useCourses();
  const { bimesters = [], loading: bimestersLoading } = useBimesters();
  const { users = [], loading: usersLoading } = useUsers();

  const sections = [...new Set(alumnos.map(s => s.section))];
  const currentBimester = bimesters.find(b => b.id === selectedBimester);

  // Filter teachers (subject_teacher role) from users
    const teachers: {
      id: string;
      name: string;
      courses: string | string[];
      sections: string[];
      activity: number;
    }[] = (users || [])
      .filter(u => u.role === 'subject_teacher')
      .map(u => ({
        id: u.id,
        name: u.fullName,
        // keep assignedCourses array when available so UI can join names, otherwise show a label
        courses: u.assignedCourses?.length ? u.assignedCourses : 'Sin cursos',
        sections: u.assignedSections || [],
        activity: Math.round(Math.random() * 25 + 75) // TODO: Calculate from real data
      }))
      .slice(0, 6); // Limit to first 6 for display

  const getCourseStatus = (section: string, course: any) => {
    const students = alumnos.filter(s => s.section === section);
     const grades = gradesStore.getGrades({ 
       section, 
       bimester: selectedBimester,
       courseId: course.id 
     });
     
     const totalExpected = students.length;
     const completed = grades.filter(g => g.value !== null).length;
     const percentage = totalExpected > 0 ? Math.round((completed / totalExpected) * 100) : 0;

     return {
       course: course.name,
       completed,
       total: totalExpected,
       percentage,
       status: percentage === 100 ? 'complete' : percentage > 0 ? 'partial' : 'pending'
     };
   };

   const getSectionReportCardStatus = (section: string) => {
     const consolidation = gradesStore.getConsolidation(section, selectedBimester);
    const grades = gradesStore.getGrades({ section, bimester: selectedBimester });
    const students = alumnos.filter(s => s.section === section);
     
    const totalExpected = students.length * allCourses.length;
     const completed = grades.filter(g => g.value !== null).length;
     const percentage = Math.round((completed / totalExpected) * 100);

     return {
       section,
       studentsCount: students.length,
       percentage,
       isClosed: consolidation?.isClosed || false,
       canGenerate: consolidation?.isClosed && percentage === 100
     };
   };

  const reportCardStatuses = (sections || []).map(section => getSectionReportCardStatus(section));

   return (
     <div className="p-6 space-y-6">
       <div>
         <h1 className="text-2xl">Reportes</h1>
         <p className="text-gray-600 mt-1 text-sm">
          Seguimiento y análisis del sistema académico
          {(alumnosLoading || coursesLoading || bimestersLoading || usersLoading) && ' (Cargando...)'}
         </p>
       </div>

       <Tabs defaultValue="courses" className="w-full">
         <TabsList>
           <TabsTrigger value="courses">Estado de Cursos</TabsTrigger>
           <TabsTrigger value="activity">Actividad de Profesores</TabsTrigger>
           <TabsTrigger value="reportcards">Estado de Libretas</TabsTrigger>
         </TabsList>

         {/* Tab: Estado de Cursos */}
         <TabsContent value="courses" className="space-y-6">
           <Card className="border-0 shadow-sm">
             <CardHeader>
               <CardTitle className="text-lg">Estado del Registro por Curso y Sección</CardTitle>
               <CardDescription>
                Progreso de registro de notas - {currentBimester?.name || 'Cargando...'}
               </CardDescription>
             </CardHeader>
             <CardContent>
              {alumnosLoading || coursesLoading ? (
                <p className="text-center text-gray-500 py-8">Cargando datos...</p>
              ) : (
                <>
                  {(sections || []).map(section => {
                    const courseStatuses = (allCourses || []).map(course => getCourseStatus(section, course));
                    const sectionAvg = Math.round(
                      courseStatuses.reduce((acc, cs) => acc + cs.percentage, 0) / (courseStatuses.length || 1)
                    );

                    return (
                      <div key={section} className="mb-8 last:mb-0">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-medium text-lg">Sección {section}</h3>
                            <p className="text-sm text-gray-600">
                             {courseStatuses.filter(c => c.status === 'complete').length} de {allCourses.length} cursos completos
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-2xl font-medium">{sectionAvg}%</div>
                              <p className="text-xs text-gray-500">Cobertura total</p>
                            </div>
                            <Progress value={sectionAvg} className="w-24" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {courseStatuses.map((cs, idx) => (
                            <div 
                              key={idx}
                              className={`p-3 border rounded-lg ${
                                cs.status === 'complete' ? 'bg-green-50 border-green-200' :
                                cs.status === 'partial' ? 'bg-yellow-50 border-yellow-200' :
                                'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{cs.course}</p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {cs.completed}/{cs.total} estudiantes
                                  </p>
                                </div>
                                {cs.status === 'complete' ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : cs.status === 'partial' ? (
                                  <Clock className="h-4 w-4 text-yellow-600" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                              <Progress value={cs.percentage} className="h-2" />
                              <p className="text-xs text-right mt-1 text-gray-600">{cs.percentage}%</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
             </CardContent>
           </Card>
         </TabsContent>

         {/* Tab: Actividad de Profesores */}
         <TabsContent value="activity" className="space-y-6">
           <Card className="border-0 shadow-sm">
             <CardHeader>
               <CardTitle className="text-lg">Actividad de Profesores</CardTitle>
               <CardDescription>
                 Seguimiento de participación en el sistema
               </CardDescription>
             </CardHeader>
             <CardContent>
              {usersLoading ? (
                <p className="text-center text-gray-500 py-8">Cargando profesores...</p>
              ) : (
               <div className="space-y-4">
                 {teachers.map(teacher => (
                   <div 
                     key={teacher.id}
                     className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                   >
                     <div className="flex items-start justify-between mb-3">
                       <div className="flex items-start gap-3">
                         <div className="p-2 bg-green-100 rounded-full">
                           <User className="h-5 w-5 text-green-700" />
                         </div>
                         <div>
                           <h3 className="font-medium">{teacher.name}</h3>
                           <p className="text-sm text-gray-600 mt-1">
                             {typeof teacher.courses === 'string' ? teacher.courses : Array.isArray(teacher.courses) ? teacher.courses.join(', ') : ''}
                           </p>
                           <div className="flex gap-2 mt-2">
                             {(teacher.sections || []).map(sec => (
                               <Badge key={sec} variant="outline" className="text-xs">
                                 {sec}
                               </Badge>
                             ))}
                           </div>
                         </div>
                       </div>
                       <div className="text-right">
                         <div className="flex items-center gap-2">
                           <TrendingUp className={`h-4 w-4 ${
                             teacher.activity >= 90 ? 'text-green-600' :
                             teacher.activity >= 75 ? 'text-yellow-600' :
                             'text-red-600'
                           }`} />
                           <span className="text-2xl font-medium">{teacher.activity}%</span>
                         </div>
                         <p className="text-xs text-gray-500 mt-1">Actividad</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-3">
                       <Progress value={teacher.activity} className="flex-1" />
                       {teacher.activity === 100 ? (
                         <Badge className="bg-green-100 text-green-800">
                           <CheckCircle2 className="h-3 w-3 mr-1" />
                           Completo
                         </Badge>
                       ) : teacher.activity >= 75 ? (
                         <Badge className="bg-yellow-100 text-yellow-800">
                           En progreso
                         </Badge>
                       ) : (
                         <Badge className="bg-red-100 text-red-800">
                           Atención
                         </Badge>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
              )}
             </CardContent>
           </Card>

           {/* Summary Stats */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card className="border-0 shadow-sm">
               <CardHeader className="flex flex-row items-center justify-between pb-2">
                 <CardTitle className="text-sm text-gray-600">Profesores Activos</CardTitle>
                 <User className="h-5 w-5 text-green-700" />
               </CardHeader>
               <CardContent>
                <div className="text-3xl">
                  {usersLoading ? '—' : `${teachers.filter(t => t.activity >= 75).length}/${teachers.length}`}
                </div>
                 <p className="text-xs text-gray-500 mt-1">
                   con actividad mayor a 75%
                 </p>
               </CardContent>
             </Card>

             <Card className="border-0 shadow-sm">
               <CardHeader className="flex flex-row items-center justify-between pb-2">
                 <CardTitle className="text-sm text-gray-600">Promedio General</CardTitle>
                 <TrendingUp className="h-5 w-5 text-green-700" />
               </CardHeader>
               <CardContent>
                 <div className="text-3xl">
                  {usersLoading ? '—' : `${Math.round(teachers.reduce((acc, t) => acc + t.activity, 0) / (teachers.length || 1))}%`}
                 </div>
                 <p className="text-xs text-gray-500 mt-1">
                   actividad del equipo docente
                 </p>
               </CardContent>
             </Card>

             <Card className="border-0 shadow-sm">
               <CardHeader className="flex flex-row items-center justify-between pb-2">
                 <CardTitle className="text-sm text-gray-600">Requieren Atención</CardTitle>
                 <AlertCircle className="h-5 w-5 text-orange-600" />
               </CardHeader>
               <CardContent>
                <div className="text-3xl">
                  {usersLoading ? '—' : teachers.filter(t => t.activity < 75).length}
                </div>
                 <p className="text-xs text-gray-500 mt-1">
                   profesores con actividad baja
                 </p>
               </CardContent>
             </Card>
           </div>
         </TabsContent>

         {/* Tab: Estado de Libretas */}
         <TabsContent value="reportcards" className="space-y-6">
           <Card className="border-0 shadow-sm">
             <CardHeader>
               <CardTitle className="text-lg">Estado de Libretas por Salón</CardTitle>
               <CardDescription>
                 Disponibilidad para generación de libretas bimestrales
               </CardDescription>
             </CardHeader>
             <CardContent>
              {alumnosLoading ? (
                <p className="text-center text-gray-500 py-8">Cargando datos...</p>
              ) : (
               <div className="space-y-4">
                 {reportCardStatuses.map(status => (
                   <div 
                     key={status.section}
                     className={`p-4 border-2 rounded-lg ${
                       status.canGenerate ? 'bg-green-50 border-green-200' :
                       status.isClosed ? 'bg-yellow-50 border-yellow-200' :
                       'bg-gray-50 border-gray-200'
                     }`}
                   >
                     <div className="flex items-center justify-between mb-3">
                       <div>
                         <h3 className="font-medium text-lg">Sección {status.section}</h3>
                         <p className="text-sm text-gray-600 mt-1">
                           {status.studentsCount} estudiantes • {status.percentage}% de notas completadas
                         </p>
                       </div>
                       <div className="flex items-center gap-3">
                         {status.canGenerate ? (
                           <Badge className="bg-green-100 text-green-800">
                             <CheckCircle2 className="h-3 w-3 mr-1" />
                             Listo para generar
                           </Badge>
                         ) : status.isClosed ? (
                           <Badge className="bg-yellow-100 text-yellow-800">
                             <AlertCircle className="h-3 w-3 mr-1" />
                             Notas incompletas
                           </Badge>
                         ) : (
                           <Badge className="bg-gray-100 text-gray-800">
                             <Clock className="h-3 w-3 mr-1" />
                             Período abierto
                           </Badge>
                         )}
                         <Button 
                           size="sm"
                           disabled={!status.canGenerate}
                         >
                           <FileText className="h-4 w-4 mr-2" />
                           Generar
                         </Button>
                       </div>
                     </div>
                     <div className="flex items-center gap-3">
                       <Progress value={status.percentage} className="flex-1" />
                       <span className="text-sm font-medium min-w-[50px] text-right">
                         {status.percentage}%
                       </span>
                     </div>
                     {status.isClosed && !status.canGenerate && (
                       <p className="text-xs text-orange-700 mt-2">
                         ⚠ Período cerrado pero faltan notas por registrar
                       </p>
                     )}
                   </div>
                 ))}
               </div>
              )}
             </CardContent>
           </Card>

           {/* Summary */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card className="border-0 shadow-sm">
               <CardHeader className="flex flex-row items-center justify-between pb-2">
                 <CardTitle className="text-sm text-gray-600">Listos para Generar</CardTitle>
                 <CheckCircle2 className="h-5 w-5 text-green-700" />
               </CardHeader>
               <CardContent>
                 <div className="text-3xl">
                  {alumnosLoading ? '—' : `${reportCardStatuses.filter(s => s.canGenerate).length}/${sections.length}`}
                 </div>
                 <p className="text-xs text-gray-500 mt-1">
                   salones con requisitos cumplidos
                 </p>
               </CardContent>
             </Card>

             <Card className="border-0 shadow-sm">
               <CardHeader className="flex flex-row items-center justify-between pb-2">
                 <CardTitle className="text-sm text-gray-600">Períodos Cerrados</CardTitle>
                 <BookOpen className="h-5 w-5 text-green-700" />
               </CardHeader>
               <CardContent>
                 <div className="text-3xl">
                  {alumnosLoading ? '—' : `${reportCardStatuses.filter(s => s.isClosed).length}/${sections.length}`}
                 </div>
                 <p className="text-xs text-gray-500 mt-1">
                   salones con período cerrado
                 </p>
               </CardContent>
             </Card>

             <Card className="border-0 shadow-sm">
               <CardHeader className="flex flex-row items-center justify-between pb-2">
                 <CardTitle className="text-sm text-gray-600">Total de Estudiantes</CardTitle>
                 <User className="h-5 w-5 text-green-700" />
               </CardHeader>
               <CardContent>
                <div className="text-3xl">
                  {alumnosLoading ? '—' : alumnos.length}
                </div>
                 <p className="text-xs text-gray-500 mt-1">
                   en todas las secciones
                 </p>
               </CardContent>
             </Card>
           </div>
         </TabsContent>
       </Tabs>
     </div>
   );
}