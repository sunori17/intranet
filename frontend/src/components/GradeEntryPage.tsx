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
import { useAuth } from '../lib/auth-context';
import { toast } from 'sonner';
import { Save, AlertCircle, Plus, X, Send, Percent } from 'lucide-react';

interface GradeEntryPageProps {
  selectedBimester: string;
}

interface Rubric {
  id: string;
  name: string;
  percentage: number;
}

interface GradeData {
  [studentId: string]: {
    [rubricId: string]: number | null;
  };
}

export function GradeEntryPage({ selectedBimester }: GradeEntryPageProps) {
  const { user } = useAuth();
  const { alumnos = [], loading: alumnosLoading } = useAlumnos();
  const { courses: allCourses = [], loading: coursesLoading } = useCourses();
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [rubrics, setRubrics] = useState<Rubric[]>([
    { id: '1', name: 'Tareas', percentage: 30 },
    { id: '2', name: 'Exposiciones', percentage: 20 },
    { id: '3', name: 'Examen Mensual', percentage: 50 }
  ]);
  const [gradeData, setGradeData] = useState<GradeData>({});
  const [showRubricDialog, setShowRubricDialog] = useState(false);
  const [newRubricName, setNewRubricName] = useState('');
  const [newRubricPercentage, setNewRubricPercentage] = useState(0);
  const [editingRubricId, setEditingRubricId] = useState<string | null>(null);

  const assignedSections = user?.assignedSections || [];
  const assignedCourses = user?.assignedCourses || [];
  const myCourses = (allCourses || []).filter(c => assignedCourses.includes(c.id));
  
  const students = selectedSection
    ? (alumnos || []).filter(s => s.section === selectedSection)
    : [];

  const totalPercentage = rubrics.reduce((sum, r) => sum + r.percentage, 0);
  const isPercentageValid = totalPercentage === 100;

  const handleGradeChange = (studentId: string, rubricId: string, value: string) => {
    const numValue = parseFloat(value);
    if (value === '' || (numValue >= 0 && numValue <= 20)) {
      setGradeData(prev => ({
        ...prev,
        [studentId]: {
          ...(prev[studentId] || {}),
          [rubricId]: value === '' ? null : numValue
        }
      }));
    }
  };

  const calculateAverage = (studentId: string): number | null => {
    const studentGrades = gradeData[studentId];
    if (!studentGrades) return null;

    let totalWeightedGrade = 0;
    let totalWeight = 0;

    rubrics.forEach(rubric => {
      const grade = studentGrades[rubric.id];
      if (grade !== null && grade !== undefined) {
        totalWeightedGrade += grade * (rubric.percentage / 100);
        totalWeight += rubric.percentage;
      }
    });

    if (totalWeight === 0) return null;
    
    // Return the weighted average
    return Math.round((totalWeightedGrade / (totalWeight / 100)) * 100) / 100;
  };

  const handleAddRubric = () => {
    if (!newRubricName.trim()) {
      toast.error('El nombre del rubro es requerido');
      return;
    }
    if (newRubricPercentage <= 0 || newRubricPercentage > 100) {
      toast.error('El porcentaje debe estar entre 1 y 100');
      return;
    }

    if (editingRubricId) {
      setRubrics(prev => prev.map(r => 
        r.id === editingRubricId 
          ? { ...r, name: newRubricName, percentage: newRubricPercentage }
          : r
      ));
      toast.success('Rubro actualizado');
    } else {
      const newRubric: Rubric = {
        id: Date.now().toString(),
        name: newRubricName,
        percentage: newRubricPercentage
      };
      setRubrics(prev => [...prev, newRubric]);
      toast.success('Rubro agregado');
    }

    setShowRubricDialog(false);
    setNewRubricName('');
    setNewRubricPercentage(0);
    setEditingRubricId(null);
  };

  const handleEditRubric = (rubric: Rubric) => {
    setEditingRubricId(rubric.id);
    setNewRubricName(rubric.name);
    setNewRubricPercentage(rubric.percentage);
    setShowRubricDialog(true);
  };

  const handleDeleteRubric = (rubricId: string) => {
    setRubrics(prev => prev.filter(r => r.id !== rubricId));
    
    // Remove grades for this rubric
    setGradeData(prev => {
      const newData = { ...prev };
      Object.keys(newData).forEach(studentId => {
        delete newData[studentId][rubricId];
      });
      return newData;
    });
    
    toast.success('Rubro eliminado');
  };

  const handleSave = () => {
    toast.success('Notas guardadas como borrador');
  };

  const handleSendToTutor = () => {
    if (!isPercentageValid) {
      toast.error('Los porcentajes de los rubros deben sumar 100%');
      return;
    }
    toast.success('Notas enviadas al tutor exitosamente');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Registro de Notas Mensual</h1>
        <p className="text-gray-600 mt-1">
          Registre las calificaciones por rubros para sus estudiantes
          {(alumnosLoading || coursesLoading) && ' (Cargando...)'}        
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Selección de Sección y Curso</CardTitle>
          <CardDescription>Seleccione la sección y el curso para comenzar el registro</CardDescription>
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
          {/* Rubrics Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Rubros de Evaluación</CardTitle>
                  <CardDescription>
                    Configure los criterios de evaluación y sus porcentajes
                  </CardDescription>
                </div>
                <Button onClick={() => {
                  setEditingRubricId(null);
                  setNewRubricName('');
                  setNewRubricPercentage(0);
                  setShowRubricDialog(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Rubro
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!isPercentageValid && (
                <Alert className="mb-4 border-[#ff8000] bg-[#ffe6cc]">
                  <AlertCircle className="h-4 w-4 text-[#ff8000]" />
                  <AlertDescription className="text-[#994d00]">
                    La suma de porcentajes debe ser 100%. Actualmente es {totalPercentage}%
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                {rubrics.map(rubric => (
                  <div 
                    key={rubric.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{rubric.name}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Percent className="h-3 w-3" />
                          {rubric.percentage}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditRubric(rubric)}
                      >
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteRubric(rubric.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm">
                  <span className="font-medium">Total: {totalPercentage}%</span>
                  {isPercentageValid && (
                    <Badge className="ml-2 bg-green-600">✓ Válido</Badge>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Grades Table */}
          <Card>
            <CardHeader>
              <CardTitle>Registro de Calificaciones</CardTitle>
              <CardDescription>
                Ingrese las notas por rubro (escala 0-20). El promedio actual se calcula automáticamente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alumnosLoading ? (
               <p className="text-center text-gray-500 py-8">Cargando estudiantes...</p>
             ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 bg-gray-50 sticky left-0 z-10">Estudiante</th>
                      {rubrics.map(rubric => (
                        <th key={rubric.id} className="text-center p-3 bg-gray-50 min-w-[100px]">
                          {rubric.name}
                          <br />
                          <span className="text-xs text-gray-500">({rubric.percentage}%)</span>
                        </th>
                      ))}
                      <th className="text-center p-3 bg-green-50 font-medium sticky right-0 z-10">
                        Promedio Actual
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => {
                      const average = calculateAverage(student.id);
                      return (
                        <tr key={student.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 sticky left-0 bg-white z-10 font-medium">
                            {student.fullName || `${student.nombre || ''} ${student.apellido || ''}`}
                          </td>
                          {rubrics.map(rubric => (
                            <td key={rubric.id} className="p-3 text-center">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="20"
                                value={gradeData[student.id]?.[rubric.id] ?? ''}
                                onChange={(e) => handleGradeChange(student.id, rubric.id, e.target.value)}
                                className="w-20 text-center"
                                placeholder="0-20"
                              />
                            </td>
                          ))}
                          <td className="p-3 text-center sticky right-0 bg-green-50 z-10">
                            <div className="font-medium text-green-700">
                              {average !== null ? average.toFixed(2) : '-'}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-3">
                <Button variant="outline" size="lg" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Borrador
                </Button>
                <Button size="lg" onClick={handleSendToTutor} disabled={!isPercentageValid}>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar al Tutor
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Add/Edit Rubric Dialog */}
      <Dialog open={showRubricDialog} onOpenChange={setShowRubricDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRubricId ? 'Editar Rubro' : 'Agregar Rubro'}
            </DialogTitle>
            <DialogDescription>
              Configure el nombre y porcentaje del rubro de evaluación
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre del Rubro</Label>
              <Input
                placeholder="Ej: Tareas, Exposiciones, Examen"
                value={newRubricName}
                onChange={(e) => setNewRubricName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Porcentaje (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="0-100"
                value={newRubricPercentage || ''}
                onChange={(e) => setNewRubricPercentage(parseFloat(e.target.value) || 0)}
              />
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                La suma total de todos los rubros debe ser 100%
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRubricDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddRubric}>
              {editingRubricId ? 'Actualizar' : 'Agregar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
