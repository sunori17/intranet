import { ReactNode } from 'react';
import { useAuth } from '../lib/auth-context';
import useBimesters from '../hooks/useBimesters';
import {
  LayoutDashboard,
  Users,
  FileText,
  BookOpen,
  LogOut,
  BarChart3,
  ClipboardList
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Avatar, AvatarFallback } from './ui/avatar';
import escudo from '../assets/escudo.jpg';

interface AppLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  selectedBimester: string;
  onBimesterChange: (bimester: string) => void;
}

export function AppLayout({ 
  children, 
  currentPage, 
  onNavigate,
  selectedBimester,
  onBimesterChange
}: AppLayoutProps) {
  const { user, logout } = useAuth();
  const { bimesters = [] } = useBimesters();

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
      case 'tutor': return 'bg-green-100 text-green-800';
      case 'subject_teacher': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.length >= 2 
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : name.substring(0, 2);
  };

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Inicio',
      icon: LayoutDashboard,
      roles: ['principal', 'tutor', 'subject_teacher']
    },
    {
      id: 'accounts',
      label: 'Gestión de Usuarios',
      icon: Users,
      roles: ['principal']
    },
    {
      id: 'grades',
      label: 'Registro de Notas',
      icon: BookOpen,
      roles: ['subject_teacher']
    },
    {
      id: 'bimester-grade',
      label: 'Nota Bimestral',
      icon: ClipboardList,
      roles: ['subject_teacher']
    },
    {
      id: 'history',
      label: 'Historial',
      icon: FileText,
      roles: ['subject_teacher']
    },
    {
      id: 'consolidation',
      label: 'Consolidado',
      icon: ClipboardList,
      roles: ['tutor']
    },
    {
      id: 'report-cards',
      label: 'Libretas Bimestrales',
      icon: FileText,
      roles: ['principal', 'tutor']
    },
    {
      id: 'final-report-cards',
      label: 'Libretas Finales',
      icon: FileText,
      roles: ['principal', 'tutor']
    },
    {
      id: 'ugel',
      label: 'Gestión UGEL',
      icon: BarChart3,
      roles: ['principal', 'tutor']
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: BarChart3,
      roles: ['principal']
    }
  ];

  const visibleItems = navigationItems.filter(item =>
    item.roles.includes(user?.role || '')
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-[#166534] border-b border-green-900 sticky top-0 z-40">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src={escudo} alt="IEP Cristo Redentor" className="w-full h-full object-contain" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-semibold text-white">IEP Cristo Redentor de Nocheto</h1>
                <p className="text-xs text-green-100">Intranet Académica</p>
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            <Select value={selectedBimester} onValueChange={onBimesterChange}>
              <SelectTrigger className="w-[200px] hidden sm:flex bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(bimesters || []).map(bim => (
                  <SelectItem key={bim.id} value={bim.id}>
                    {bim.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile bimester selector */}
        <div className="sm:hidden px-4 pb-3">
          <Select value={selectedBimester} onValueChange={onBimesterChange}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(bimesters || []).map(bim => (
                <SelectItem key={bim.id} value={bim.id}>
                  {bim.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Always visible on all screen sizes */}
        <aside className="sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 bg-[#d4d1cf] border-r border-gray-300 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {/* User Profile Card */}
            <div className="p-4 border-b border-gray-300">
              <div className="bg-white rounded-xl p-4 border border-gray-300 shadow-sm">
                <div className="flex flex-col items-center text-center space-y-3">
                  <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                    <AvatarFallback className="bg-gradient-to-br from-[#166534] to-green-700 text-white text-lg">
                      {getInitials(user?.fullName || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="w-full">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                      {user?.fullName}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {getRoleLabel(user?.role || '')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="p-4 space-y-1">
              {visibleItems.map(item => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                      ${isActive 
                        ? 'bg-gradient-to-r from-[#166534] to-green-700 text-white shadow-md' 
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-[#ffe6cc]'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              
              {/* Logout Button */}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-red-600 hover:bg-red-50 mt-4"
              >
                <LogOut className="h-5 w-5" />
                <span>Cerrar Sesión</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}