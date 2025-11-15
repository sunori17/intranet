from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import MySQLConnection, SyncLog
from .serializers import (
    MySQLConnectionSerializer, SyncLogSerializer,
    StudentSyncSerializer, GradeSyncSerializer, BoletaSyncSerializer
)
from .mysql_service import MySQLService, MySQLSyncService


class MySQLConnectionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar conexiones a bases de datos MySQL externas.
    """
    queryset = MySQLConnection.objects.all()
    serializer_class = MySQLConnectionSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['post'])
    def test_connection(self, request, pk=None):
        """Prueba la conexión con una base de datos MySQL."""
        connection = self.get_object()
        
        try:
            mysql_service = MySQLService(connection.name)
            if mysql_service.connect():
                mysql_service.disconnect()
                return Response({
                    'status': 'success',
                    'message': f'Conexión exitosa a {connection.name}'
                })
            else:
                return Response({
                    'status': 'error',
                    'message': 'No se pudo establecer la conexión'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SyncLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para consultar logs de sincronización.
    """
    queryset = SyncLog.objects.all()
    serializer_class = SyncLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filtra logs por parámetros de consulta."""
        queryset = super().get_queryset()
        
        connection_id = self.request.query_params.get('connection_id')
        operation = self.request.query_params.get('operation')
        status_filter = self.request.query_params.get('status')
        
        if connection_id:
            queryset = queryset.filter(connection_id=connection_id)
        if operation:
            queryset = queryset.filter(operation__icontains=operation)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        return queryset


class MySQLSyncViewSet(viewsets.GenericViewSet):
    """
    ViewSet para operaciones de sincronización con MySQL.
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def sync_student(self, request):
        """Sincroniza datos de un estudiante con MySQL."""
        serializer = StudentSyncSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        connection_name = request.data.get('connection_name', 'default')
        
        try:
            sync_service = MySQLSyncService(connection_name)
            success = sync_service.sync_student_data(serializer.validated_data)
            
            if success:
                return Response({
                    'status': 'success',
                    'message': 'Estudiante sincronizado correctamente'
                })
            else:
                return Response({
                    'status': 'error',
                    'message': 'Error al sincronizar estudiante'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def sync_grade(self, request):
        """Sincroniza datos de una nota con MySQL."""
        serializer = GradeSyncSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        connection_name = request.data.get('connection_name', 'default')
        
        try:
            sync_service = MySQLSyncService(connection_name)
            success = sync_service.sync_grade_data(serializer.validated_data)
            
            if success:
                return Response({
                    'status': 'success',
                    'message': 'Nota sincronizada correctamente'
                })
            else:
                return Response({
                    'status': 'error',
                    'message': 'Error al sincronizar nota'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def sync_boleta(self, request):
        """Sincroniza datos de boleta con MySQL."""
        serializer = BoletaSyncSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        connection_name = request.data.get('connection_name', 'default')
        
        try:
            with MySQLService(connection_name) as mysql:
                success = mysql.actualizar_detalle_boleta(
                    id_boleta=serializer.validated_data['id_boleta'],
                    id_asignatura_trabajada=serializer.validated_data['id_asignatura_trabajada'],
                    bimestre=serializer.validated_data['bimestre'],
                    promedio_bimestral=float(serializer.validated_data['promedio_bimestral'])
                )
                
                if success:
                    return Response({
                        'status': 'success',
                        'message': 'Boleta sincronizada correctamente'
                    })
                else:
                    return Response({
                        'status': 'error',
                        'message': 'Error al sincronizar boleta'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                    
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def create_boleta(self, request):
        """Crea una boleta vacía en MySQL."""
        id_alumno = request.data.get('id_alumno')
        if not id_alumno:
            return Response({
                'error': 'Se requiere id_alumno'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        connection_name = request.data.get('connection_name', 'default')
        
        try:
            with MySQLService(connection_name) as mysql:
                boleta_id = mysql.crear_boleta_vacia(int(id_alumno))
                
                if boleta_id:
                    return Response({
                        'status': 'success',
                        'message': f'Boleta creada con ID: {boleta_id}',
                        'boleta_id': boleta_id
                    })
                else:
                    return Response({
                        'status': 'error',
                        'message': 'Error al crear boleta'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                    
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def get_student_grades(self, request):
        """Obtiene notas de un estudiante desde MySQL."""
        id_alumno = request.query_params.get('id_alumno')
        id_asignatura_trabajada = request.query_params.get('id_asignatura_trabajada')
        bimestre = request.query_params.get('bimestre')
        
        if not all([id_alumno, id_asignatura_trabajada, bimestre]):
            return Response({
                'error': 'Se requieren id_alumno, id_asignatura_trabajada y bimestre'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        connection_name = request.query_params.get('connection_name', 'default')
        
        try:
            with MySQLService(connection_name) as mysql:
                notas = mysql.obtener_notas_de_bimestre(
                    int(id_alumno),
                    int(id_asignatura_trabajada),
                    int(bimestre)
                )
                
                if notas is not None:
                    return Response({
                        'status': 'success',
                        'notas': [{'nombre': nota[0], 'calificacion': nota[1]} for nota in notas]
                    })
                else:
                    return Response({
                        'status': 'error',
                        'message': 'Error al obtener notas'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                    
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)