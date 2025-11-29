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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import useUsers from '../hooks/useUsers';
import { Plus, Edit, Trash2, Key, Search } from 'lucide-react';

export function AccountsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const { users = [], loading: usersLoading } = useUsers();

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'principal': return 'Director';
      case 'tutor': return 'Tutor';
      case 'subject_teacher': return 'Profesor';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'principal': return 'bg-purple-100 text-purple-800';
      case 'tutor': return 'bg-blue-100 text-blue-800';
      case 'subject_teacher': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setShowDialog(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setShowDialog(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Gestión de Cuentas</h1>
          <p className="text-gray-600 mt-1">
            Administre usuarios, roles y permisos del sistema
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Usuario
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nombre, usuario o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Filtrar por Rol</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Roles</SelectItem>
                  <SelectItem value="principal">Director</SelectItem>
                  <SelectItem value="tutor">Tutor</SelectItem>
                  <SelectItem value="subject_teacher">Profesor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
          <CardDescription>
            {usersLoading ? 'Cargando usuarios...' : `${filteredUsers.length} usuario${filteredUsers.length !== 1 ? 's' : ''} encontrado${filteredUsers.length !== 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 bg-gray-50">Nombre Completo</th>
                  <th className="text-left p-3 bg-gray-50">Usuario</th>
                  <th className="text-left p-3 bg-gray-50">Email</th>
                  <th className="text-left p-3 bg-gray-50">Rol</th>
                  <th className="text-left p-3 bg-gray-50">Asignaciones</th>
                  <th className="text-center p-3 bg-gray-50">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{user.fullName}</div>
                    </td>
                    <td className="p-3">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">{user.username}</code>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="p-3">
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm">
                      {user.assignedSections && (
                        <div className="text-gray-600">
                          Secciones: {user.assignedSections.join(', ')}
                        </div>
                      )}
                      {user.assignedCourses && (
                        <div className="text-gray-600">
                          {user.assignedCourses.length} curso(s)
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </DialogTitle>
            <DialogDescription>
              Complete los datos del usuario y sus asignaciones
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre Completo</Label>
                <Input placeholder="Ej: Prof. Juan Pérez López" />
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="principal">Director</SelectItem>
                    <SelectItem value="tutor">Tutor</SelectItem>
                    <SelectItem value="subject_teacher">Profesor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Usuario</Label>
                <Input placeholder="username" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="usuario@iepcristoredentor.edu.pe" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Contraseña</Label>
              <Input type="password" placeholder="●●●●●●●●" />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Asignaciones</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Secciones Asignadas</Label>
                  <Input placeholder="Ej: 1°A, 2°B" />
                </div>
                <div className="space-y-2">
                  <Label>Cursos Asignados</Label>
                  <Input placeholder="Seleccione cursos..." />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowDialog(false)}>
              {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
