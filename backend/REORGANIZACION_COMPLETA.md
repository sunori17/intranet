# SEGUNDO ENTREGABLE - PS Grupo 6
## Sistema de Intranet Escolar - Backend Reorganizado

### 📁 Estructura del Proyecto

```
backend/
├── apps/
│   ├── accesos/          # Autenticación, roles, permisos, auditoría
│   ├── notas/            # Registro de notas mensuales y exámenes bimestrales
│   ├── consolidacion/    # Consolidación bimestral y reportes UGEL
│   ├── libretas/         # Generación de PDFs y manejo de archivos Excel
│   └── bd_externa/       # Conexión y sincronización con MySQL externa
├── intranet/             # Configuración principal Django
├── media/                # Archivos subidos (Excel UGEL, PDFs generados)
├── db.sqlite3            # Base de datos SQLite (desarrollo)
├── manage.py
└── requirements.txt
```

### 🚀 Módulos Implementados

#### 1. **apps.accesos** - Sistema de Autenticación
- **Propósito**: Gestión de usuarios, roles, permisos y auditoría
- **Modelos principales**: 
  - `UGELDelegation`: Delegaciones UGEL
  - `AuditLog`: Registro de auditoría
  - `PasswordResetMock`: Reset de contraseñas
  - `Period`: Períodos académicos
- **APIs**: `/api/accesos/`

#### 2. **apps.notas** - Registro de Calificaciones  
- **Propósito**: Captura de notas mensuales y exámenes bimestrales
- **Modelos principales**:
  - `NotaMensual`: Notas mensuales por estudiante/curso/mes
  - `ExamenBimestral`: Calificaciones de exámenes bimestrales
  - `EstadoCierreMensual`: Control de bloqueo por mes
  - `Curso`, `Seccion`: Referencias básicas
- **Lógica de negocio**: 
  - Regla 50-50: `(Promedio Mensual + Examen Bimestral) / 2`
  - Redondeo comercial con `ROUND_HALF_UP`: 14.5 → 15
  - Validación de bloqueos por cierre mensual
- **APIs**: `/api/notas/`

#### 3. **apps.consolidacion** - Cálculos y Posiciones
- **Propósito**: Consolidación bimestral y conversión a escala UGEL
- **Modelos principales**:
  - `ConsolidadoBimestral`: Promedios finales por bimestre
  - `ConsolidadoUGEL`: Consolidación anual con escala de letras
  - `Bimestre`: Períodos bimestrales
- **Lógica de negocio**:
  - Cálculo de posiciones con manejo de empates
  - Conversión a escala UGEL: AD (18-20), A (14-17), B (11-13), C (0-10)
  - Generación automática de comentarios
- **APIs**: `/api/consolidacion/`

#### 4. **apps.libretas** - Documentos y Archivos UGEL
- **Propósito**: Generación de PDFs y manejo de archivos Excel UGEL
- **Características**:
  - ✅ **PDFs Funcionales**: Inicial (18KB), Primaria (27KB), Secundaria (24KB)
  - ✅ **Excel Real**: Integración completa con `openpyxl`
  - ✅ **Almacenamiento**: Sistema de archivos con `storage.py`
  - ✅ **Tests**: 7 pruebas unitarias pasando
- **Tecnologías**: WeasyPrint, openpyxl, HTML/CSS templates
- **APIs**: `/api/libretas/`

#### 5. **apps.bd_externa** - Sincronización MySQL
- **Propósito**: Integración con base de datos MySQL externa
- **Funcionalidades**:
  - Conexión configurable a MySQL
  - Sincronización de estudiantes y notas
  - Gestión de boletas externas
  - Logs de sincronización
- **Modelos base**: Basado en el `models.py` proporcionado (Alumno, Nota, Boleta, etc.)
- **APIs**: `/api/bd-externa/`

### 📊 Reglas de Negocio Implementadas

#### Cálculo de Promedios
```python
# Promedio Bimestral (Regla 50-50)
promedio_final = (promedio_mensual + examen_bimestral) / 2

# Redondeo Comercial para Libretas
nota_libreta = int(promedio.quantize(Decimal('1'), rounding=ROUND_HALF_UP))
# Ejemplo: 14.5 → 15, 14.4 → 14
```

#### Escala UGEL
- **AD**: 18-20 (Logro Destacado)
- **A**: 14-17 (Logro Esperado)  
- **B**: 11-13 (En Proceso)
- **C**: 0-10 (En Inicio)

#### Cálculo de Posiciones
```python
# Posición considerando empates
posicion = cantidad_estudiantes_con_mejor_promedio + 1
```

### 🔧 Configuración y Uso

#### 1. Instalación de Dependencias
```bash
cd backend
pip install -r requirements.txt
```

#### 2. Migraciones de Base de Datos
```bash
python manage.py makemigrations
python manage.py migrate
```

#### 3. Ejecutar Servidor de Desarrollo
```bash
python manage.py runserver
```

#### 4. Ejecutar Tests
```bash
python manage.py test apps.libretas
```

### 🗄️ Bases de Datos

#### SQLite (Desarrollo)
- **Ubicación**: `backend/db.sqlite3`
- **Propósito**: Desarrollo y pruebas locales
- **Modelos**: Todos los módulos Django

#### MySQL Externa (Integración)
- **Propósito**: Sistema legacy existente
- **Conexión**: Via `apps.bd_externa.mysql_service`
- **Modelos**: `Alumno`, `Nota`, `Boleta`, etc. (managed=False)

#### PostgreSQL/Supabase (Futuro)
- **Propósito**: Base de datos productiva
- **Estado**: Pendiente de configuración

### 📁 Archivos y Media

#### Estructura de Media
```
media/
├── libretas/
│   ├── uploads/          # Archivos Excel UGEL subidos
│   └── generated/        # PDFs generados
└── exports/              # Archivos de exportación
```

#### Gestión de Archivos
- **Upload**: `POST /api/libretas/upload-ugel/`
- **Download**: `GET /api/libretas/download-ugel/`
- **PDFs**: `GET /api/libretas/generar-pdf/`

### 🔐 Principios Implementados

#### Clean Code
- ✅ Eliminación de comentarios redundantes
- ✅ Nombres descriptivos de variables y funciones
- ✅ Separación de responsabilidades por módulos
- ✅ Documentación concisa y útil

#### Arquitectura
- ✅ **Separation of Concerns**: Cada app tiene una responsabilidad específica
- ✅ **DRY**: Reutilización de lógica común (grade_logic.py)
- ✅ **Single Responsibility**: Modelos, servicios y vistas enfocados
- ✅ **Dependency Injection**: Servicios inyectables (MySQLService)

### 🧪 Testing

#### Apps.Libretas (7 tests ✅)
```bash
test_generar_pdf_inicial_success
test_generar_pdf_primaria_success  
test_generar_pdf_secundaria_success
test_upload_ugel_file_success
test_download_ugel_file_success
test_process_excel_data_success
test_storage_file_management
```

### 📊 Estado del Proyecto

| Módulo | Estado | Funcionalidad | Tests |
|---------|---------|---------------|-------|
| **accesos** | ✅ Completo | Autenticación, roles, auditoría | ⏳ Pendiente |
| **notas** | ✅ Completo | Registro notas, regla 50-50 | ⏳ Pendiente |
| **consolidacion** | ✅ Completo | Cálculos, posiciones, UGEL | ⏳ Pendiente |
| **libretas** | ✅ Completo | PDFs, Excel, archivos | ✅ 7 tests |
| **bd_externa** | ✅ Completo | Sincronización MySQL | ⏳ Pendiente |

### 🚧 Próximos Pasos

1. **Configurar PostgreSQL/Supabase** en producción
2. **Implementar tests unitarios** para módulos restantes  
3. **Configurar CI/CD** para despliegue automático
4. **Implementar autenticación JWT** para APIs
5. **Crear documentación de API** con Swagger/OpenAPI
6. **Optimizar consultas** de base de datos para rendimiento

### 📞 Soporte

Para dudas sobre la implementación, revisar:
- **Código fuente**: Cada módulo está documentado internamente
- **Tests**: `apps/libretas/tests/` contiene ejemplos de uso
- **APIs**: Endpoints documentados en cada `urls.py`