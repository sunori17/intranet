from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from decimal import Decimal
from .models import ConsolidadoBimestral, ConsolidadoUGEL
from .consolidacion_service import ConsolidacionService
from .serializers import (
    ConsolidadoBimestralSerializer, 
    ConsolidadoUGELSerializer,
    ConsolidadoUGELReportSerializer
)


class ConsolidadoBimestralViewSet(viewsets.ModelViewSet):
    queryset = ConsolidadoBimestral.objects.all()
    serializer_class = ConsolidadoBimestralSerializer
    
    @action(detail=False, methods=['post'])
    def consolidar(self, request):
        """Consolida un bimestre específico con promedio mensual y examen."""
        estudiante_id = request.data.get('estudiante_id')
        curso_id = request.data.get('curso_id')
        bimestre_id = request.data.get('bimestre_id')
        promedio_mensual = request.data.get('promedio_mensual')
        examen_bimestral = request.data.get('examen_bimestral')
        
        if not all([estudiante_id, curso_id, bimestre_id, promedio_mensual, examen_bimestral]):
            return Response(
                {'error': 'Se requieren: estudiante_id, curso_id, bimestre_id, promedio_mensual, examen_bimestral'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Convertir a Decimal
            promedio_mensual = Decimal(str(promedio_mensual))
            examen_bimestral = Decimal(str(examen_bimestral))
            
            consolidado_dto = ConsolidacionService.consolidar_bimestre(
                estudiante_id, curso_id, bimestre_id, promedio_mensual, examen_bimestral
            )
            
            # Convertir DTO a formato de respuesta
            response_data = {
                'id': consolidado_dto.id,
                'estudiante_id': consolidado_dto.estudiante_id,
                'estudiante_nombre': consolidado_dto.estudiante_nombre,
                'curso_id': consolidado_dto.curso_id,
                'curso_nombre': consolidado_dto.curso_nombre,
                'bimestre_id': consolidado_dto.bimestre_id,
                'bimestre_nombre': consolidado_dto.bimestre_nombre,
                'promedio_mensual_1': float(consolidado_dto.promedio_mensual_1) if consolidado_dto.promedio_mensual_1 else None,
                'examen_bimestral': float(consolidado_dto.examen_bimestral) if consolidado_dto.examen_bimestral else None,
                'promedio_final': float(consolidado_dto.promedio_final) if consolidado_dto.promedio_final else None,
                'posicion': consolidado_dto.posicion,
                'cerrado': consolidado_dto.cerrado,
                'precondiciones_cumplidas': consolidado_dto.precondiciones_cumplidas,
                'errores': consolidado_dto.errores
            }
            
            return Response(response_data)
            
        except Exception as e:
            return Response(
                {'error': f'Error en consolidación: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def verificar_precondiciones(self, request):
        """Verifica precondiciones para consolidación."""
        estudiante_id = request.query_params.get('estudiante_id')
        curso_id = request.query_params.get('curso_id')
        bimestre_id = request.query_params.get('bimestre_id')
        
        if not all([estudiante_id, curso_id, bimestre_id]):
            return Response(
                {'error': 'Se requieren estudiante_id, curso_id y bimestre_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        precondiciones = ConsolidacionService.verificar_precondiciones_bimestre(
            estudiante_id, curso_id, bimestre_id
        )
        
        return Response({
            'cumplida': precondiciones.cumplida,
            'mensaje': precondiciones.mensaje,
            'detalles': precondiciones.detalles
        })

    def get_queryset(self):
        """Filtra consolidados por parámetros de consulta."""
        queryset = super().get_queryset()
        
        estudiante_id = self.request.query_params.get('estudiante_id')
        curso_id = self.request.query_params.get('curso_id')
        bimestre_id = self.request.query_params.get('bimestre_id')
        
        if estudiante_id:
            queryset = queryset.filter(estudiante_id=estudiante_id)
        if curso_id:
            queryset = queryset.filter(curso_id=curso_id)
        if bimestre_id:
            queryset = queryset.filter(bimestre_id=bimestre_id)
            
        return queryset


class ConsolidadoUGELViewSet(viewsets.ModelViewSet):
    queryset = ConsolidadoUGEL.objects.all()
    serializer_class = ConsolidadoUGELSerializer
    
    @action(detail=False, methods=['post'])
    def consolidar(self, request):
        """Consolida reporte UGEL para estudiante y curso."""
        estudiante_id = request.data.get('estudiante_id')
        curso_id = request.data.get('curso_id')
        
        if not all([estudiante_id, curso_id]):
            return Response(
                {'error': 'Se requieren estudiante_id y curso_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            consolidado_dto = ConsolidacionService.consolidar_ugel(estudiante_id, curso_id)
            
            response_data = {
                'id': consolidado_dto.id,
                'estudiante_id': consolidado_dto.estudiante_id,
                'estudiante_codigo': consolidado_dto.estudiante_codigo,
                'estudiante_nombre': consolidado_dto.estudiante_nombre,
                'curso_id': consolidado_dto.curso_id,
                'curso_nombre': consolidado_dto.curso_nombre,
                'bimestre_1': float(consolidado_dto.bimestre_1) if consolidado_dto.bimestre_1 else None,
                'bimestre_2': float(consolidado_dto.bimestre_2) if consolidado_dto.bimestre_2 else None,
                'bimestre_3': float(consolidado_dto.bimestre_3) if consolidado_dto.bimestre_3 else None,
                'bimestre_4': float(consolidado_dto.bimestre_4) if consolidado_dto.bimestre_4 else None,
                'promedio_final': float(consolidado_dto.promedio_final),
                'letra': consolidado_dto.letra,
                'posicion_curso': consolidado_dto.posicion_curso,
                'comentario': consolidado_dto.comentario,
                'bimestres_disponibles': consolidado_dto.bimestres_disponibles
            }
            
            return Response(response_data)
            
        except Exception as e:
            return Response(
                {'error': f'Error en consolidación UGEL: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def reporte_ugel(self, request):
        """Obtiene todos los consolidados UGEL para generar reporte."""
        curso_id = request.query_params.get('curso_id')
        
        queryset = self.get_queryset()
        if curso_id:
            queryset = queryset.filter(curso_id=curso_id)
        
        # Usar el servicio para asegurar datos actualizados
        consolidados_actualizados = []
        for consolidado in queryset:
            consolidado_dto = ConsolidacionService.consolidar_ugel(
                consolidado.estudiante_id, 
                consolidado.curso_id
            )
            consolidados_actualizados.append(consolidado_dto)
        
        serializer = ConsolidadoUGELReportSerializer(consolidados_actualizados, many=True)
        return Response(serializer.data)

    def get_queryset(self):
        """Filtra consolidados UGEL por parámetros de consulta."""
        queryset = super().get_queryset()
        
        estudiante_id = self.request.query_params.get('estudiante_id')
        curso_id = self.request.query_params.get('curso_id')
        
        if estudiante_id:
            queryset = queryset.filter(estudiante_id=estudiante_id)
        if curso_id:
            queryset = queryset.filter(curso_id=curso_id)
            
        return queryset