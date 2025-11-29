# Sistema de Intranet Académica - IEP Cristo Redentor de Nocheto

## 📋 Descripción General

Sistema completo de gestión académica diseñado específicamente para el IEP Cristo Redentor de Nocheto, con enfoque en registro de notas, consolidación de períodos y generación de libretas.

## 🎯 Características Principales

### ✅ Implementado Completamente

1. **Autenticación y Gestión de Usuarios**
   - Login seguro con usuarios de prueba
   - 3 roles: Director, Tutor, Profesor (Polidocente)
   - Recuperación de contraseña
   - Gestión de cuentas (solo Director)

2. **Sistema de Notas Peruano**
   - **5 Bimestres**: Marzo-Abril, Mayo-Junio, Julio-Agosto, Septiembre-Octubre, Noviembre-Diciembre
   - **13 estudiantes por sección** con datos realistas
   - **Cursos agrupados** según sistema peruano:
     - **Matemática**: Aritmética, Álgebra, Geometría, Razonamiento Matemático
     - **Comunicación Integral**: Gramática, Ortografía, Comprensión Lectora, Razonamiento Verbal
     - **Ciencia, Tecnología y Ambiente**: Biología, Física
     - **Personal Social**: Historia, Geografía
     - **Cursos Individuales**: Ed. Física, Ed. por el Arte, Ed. Religiosa, Inglés, Computación

3. **Registro de Notas (Profesor/Polidocente)**
   - Vista de cursos individuales (Aritmética, Álgebra, etc.)
   - Edición en línea con validación (0-20)
   - Guardado progresivo
   - Bloqueo automático cuando el período está cerrado
   - Indicadores de progreso y cobertura

4. **Consolidación de Período (Tutor)**
   - Vista de promedios por área agrupada
   - Detección de notas faltantes
   - Cierre y reapertura de períodos
   - Validación 100% antes de cerrar
   - Historial de consolidación

5. **Libretas de Notas**
   - Formato oficial según imagen proporcionada
   - Muestra cursos agrupados con subcursos
   - Promedios por área
   - Vista individual o por lote completo
   - Exportación a PDF (simulada)
   - Firmas de Director, Tutor y Padre/Madre

6. **Datos UGEL**
   - Notas numéricas y literales (AD/A/B/C)
   - Selector de conclusiones estandarizadas
   - Exportación a CSV para reportes anuales
   - Advertencia si el período no está cerrado

7. **Dashboard por Rol**
   - **Director**: KPIs generales, estado por sección, accesos rápidos
   - **Tutor**: Vista de su sección, consolidación, libretas
   - **Profesor**: Progreso por sección, cursos asignados, recordatorios

8. **Interfaz Responsiva**
   - Optimizada para Desktop (1440px, 1280px)
   - Tablet (768px)
   - Mobile (390px)
   - Navegación adaptativa (sidebar → menú móvil)

## 👥 Usuarios de Prueba

```
Director:
  Usuario: director
  Contraseña: 123456
  Acceso: Todo el sistema

Tutor de 1°A:
  Usuario: tutor1a
  Contraseña: 123456
  Acceso: Consolidación, Libretas, UGEL Data (Sección 1°A)

Tutor de 2°B:
  Usuario: tutor2b
  Contraseña: 123456
  Acceso: Consolidación, Libretas, UGEL Data (Sección 2°B)

Profesor de Matemática:
  Usuario: profesor1
  Contraseña: 123456
  Acceso: Registro de notas (Aritmética, Álgebra, Geometría, R. Matemático)

Profesor de Comunicación:
  Usuario: profesor2
  Contraseña: 123456
  Acceso: Registro de notas (Gramática, Ortografía, C. Lectora, R. Verbal)
```

## 📊 Datos de Prueba

- **Secciones**: 1°A (13 estudiantes), 2°B (13 estudiantes)
- **Bimestre 1**: Completo y cerrado
- **Bimestre 2**: Completo, 2°B abierto
- **Bimestre 3**: 80% completo, en progreso (actual)
- **Bimestre 4 y 5**: Sin datos aún

## 🎨 Diseño Visual

### Paleta de Colores
- **Primario**: Azul (#2563EB) - Principal identidad
- **Secundario**: Verde (#10B981) - Acciones positivas
- **Acento**: Púrpura (#8B5CF6) - Director/Admin
- **Alertas**: Naranja (#F59E0B) - Advertencias
- **Éxito**: Verde (#22C55E) - Completado
- **Error**: Rojo (#EF4444) - Errores/Crítico

### Badges de Roles
- Director: Púrpura
- Tutor: Azul
- Profesor: Verde

### Badges de Calificación
- AD (18-20): Verde - Logro Destacado
- A (14-17): Azul - Logro Esperado
- B (11-13): Amarillo - En Proceso
- C (0-10): Rojo - En Inicio

## 🔒 Permisos y Accesos

| Funcionalidad | Director | Tutor | Profesor |
|--------------|----------|-------|----------|
| Ver Dashboard | ✅ | ✅ | ✅ |
| Gestión de Cuentas | ✅ | ❌ | ❌ |
| Registro de Notas | ❌ | ❌ | ✅ |
| Consolidación | ❌ | ✅ | ❌ |
| Libretas de Notas | ✅ | ✅ | ❌ |
| Datos UGEL | ✅ | ✅ | ❌ |
| Reportes | ✅ | ❌ | ❌ |
| Configuración | ✅ | ❌ | ❌ |

## 📱 Navegación

### Barra Superior
- Logo y nombre de institución
- Selector de Bimestre (5 opciones)
- Notificaciones
- Menú de usuario (perfil, configuración, cerrar sesión)

### Sidebar Izquierdo (Adaptativo por Rol)
- Inicio
- Gestión de Cuentas (solo Director)
- Registro de Notas (solo Profesor)
- Consolidación (solo Tutor)
- Libretas de Notas (Director y Tutor)
- Datos UGEL (Director y Tutor)
- Reportes Académicos (solo Director)
- Configuración (solo Director)

## 🔄 Flujo de Trabajo

1. **Profesor registra notas** en sus cursos asignados
2. **Sistema calcula automáticamente** los promedios
3. **Tutor revisa** la consolidación de su sección
4. **Tutor verifica** que todas las notas estén completas (100%)
5. **Tutor cierra** el período
6. **Sistema bloquea** la edición de notas
7. **Tutor/Director generan** las libretas de notas
8. **Director/Tutor exportan** datos UGEL

## 🚨 Validaciones y Estados

- ✅ Notas: 0-20, con decimales permitidos
- ✅ Cierre de período: Requiere 100% de cobertura
- ✅ Edición bloqueada: Después del cierre
- ✅ Alertas visuales: Notas incompletas < 80%
- ✅ Confirmaciones: Al cerrar/reabrir períodos
- ✅ Toasts: Feedback inmediato en acciones

## 📈 KPIs y Métricas

### Dashboard Director
- Total de estudiantes
- Cobertura de notas (%)
- Períodos cerrados por sección
- Cursos activos

### Dashboard Tutor
- Estudiantes en la sección
- Cobertura de notas (%)
- Notas pendientes
- Estado del período

### Dashboard Profesor
- Secciones asignadas
- Cursos a cargo
- Notas registradas / Total
- Porcentaje de completitud

## 🎯 Microcopy y Mensajes

- **Vacío**: "No hay notas para este término aún—comience registrando las evaluaciones"
- **Bloqueado**: "La edición está deshabilitada porque el término está cerrado"
- **Incompleto**: "Faltan X notas para consolidar"
- **Listo**: "Listo para consolidar—todas las notas están completas"

## 📂 Estructura de Archivos

```
/lib
  - mock-data.ts          # Datos de prueba (estudiantes, cursos, notas)
  - auth-context.tsx      # Contexto de autenticación
  - grades-store.ts       # Store de notas con localStorage

/components
  - LoginPage.tsx         # Página de login
  - AppLayout.tsx         # Layout principal con navegación
  - PrincipalDashboard.tsx    # Dashboard de Director
  - TutorDashboard.tsx        # Dashboard de Tutor
  - SubjectTeacherDashboard.tsx # Dashboard de Profesor
  - GradeEntryPage.tsx    # Registro de notas
  - ConsolidationPage.tsx # Consolidación de período
  - ReportCardsPage.tsx   # Libretas de notas
  - UGELDataPage.tsx      # Datos UGEL
  - AccountsPage.tsx      # Gestión de cuentas
  
/components/ui
  - (ShadCN components)   # Componentes de UI reutilizables
```

## 🔧 Tecnologías Utilizadas

- React 18+ con TypeScript
- Tailwind CSS 4.0
- ShadCN UI Components
- Lucide React (iconos)
- Sonner (notificaciones)
- LocalStorage (persistencia)

## ✅ Accesibilidad

- Contraste AA nivel
- Focus visible en todos los elementos interactivos
- Navegación por teclado en tablas
- ARIA labels en iconos de acción
- Touch targets mínimos en móvil (44x44px)

## 📋 Exclusiones (Como se solicitó)

- ❌ No incluye módulo de Asistencia
- ❌ No incluye reportes de asistencia
- ❌ No incluye registro de conducta
- ❌ No incluye módulo de pagos
- ❌ No incluye portal de padres/estudiantes (en esta fase)

## 🚀 Próximas Mejoras Sugeridas

1. Módulo de Reportes Académicos completo
2. Configuración avanzada de cursos y secciones
3. Gestión de períodos escolares
4. Historial de cambios en notas
5. Comentarios y observaciones por estudiante
6. Exportación de libretas a PDF real
7. Impresión optimizada de reportes
8. Backup y restauración de datos

## 📝 Notas Importantes

- Todos los datos son **ficticios** y de **prueba**
- Los nombres de estudiantes son **inventados**
- El sistema usa **localStorage** para persistencia (solo pruebas)
- Para producción se requiere backend real con base de datos
- Las exportaciones a PDF están **simuladas**
