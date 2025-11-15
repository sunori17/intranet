from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from django.utils import timezone
from django.db.models import Sum 
from decimal import Decimal

# Importaciones locales
from .models import NotaMensual, ExamenBimestral, EstadoCierreMensual, Curso, Seccion
from .serializers import (
    NotaMensualSerializer, ExamenBimestralSerializer, 
    EstadoCierreMensualSerializer, CursoSerializer, SeccionSerializer
)
from .grade_logic import calcular_promedio_mensual, calcular_promedio_bimestral
from .audit_service import registrar_evento_auditoria


class NotaMensualAPIView(APIView):
    """
    Endpoint para registrar/actualizar (POST) y listar/filtrar (GET) Notas Mensuales.
    Aplica la validación de bloqueo (EstadoCierreMensual) en POST.
    """
    
    def get(self, request, *args, **kwargs):
        """Lista y filtra notas mensuales por parámetros de consulta."""
        filtros = {}
        if 'estudiante_id' in request.query_params:
            filtros['estudiante_id'] = request.query_params['estudiante_id']
        if 'curso_id' in request.query_params:
            filtros['curso_id'] = request.query_params['curso_id']
        if 'seccion_id' in request.query_params:
            filtros['seccion_id'] = request.query_params['seccion_id']
        if 'mes' in request.query_params:
            filtros['mes'] = request.query_params['mes']
            
        notas = NotaMensual.objects.filter(**filtros)
        serializer = NotaMensualSerializer(notas, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        """Registra o actualiza una nota mensual con validación de bloqueo."""
        serializer = NotaMensualSerializer(data=request.data)
        
        if serializer.is_valid():
            data = serializer.validated_data
            
            # Validar bloqueo por estado de cierre
            try:
                estado_cierre = EstadoCierreMensual.objects.get(
                    curso=data.get('curso'),
                    seccion=data.get('seccion'),
                    mes=data.get('mes')
                )
            except EstadoCierreMensual.DoesNotExist:
                estado_cierre = None 

            if estado_cierre and estado_cierre.estado == 'CERRADO':
                return Response(
                    {'detail': 'La edición de notas para este mes está CERRADA. Bloqueo activado.'},
                    status=status.HTTP_409_CONFLICT
                )
            
            # Crear o actualizar nota
            try:
                nota_mensual, created = NotaMensual.objects.update_or_create(
                    estudiante=data['estudiante'],
                    curso=data['curso'],
                    seccion=data['seccion'],
                    mes=data['mes'],
                    defaults={'calificacion': data['calificacion']}
                )
            except IntegrityError:
                return Response(
                    {'detail': 'Error de integridad al guardar la nota.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            response_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
            action = "creada" if created else "actualizada"
            response_serializer = NotaMensualSerializer(nota_mensual)

            return Response(
                {'detail': f'Nota {action} con éxito.', 'data': response_serializer.data},
                status=response_status
            )
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExamenBimestralAPIView(APIView):
    """
    Endpoint para registrar/actualizar (POST) y listar/filtrar (GET) Exámenes Bimestrales.
    """
    
    def get(self, request, *args, **kwargs):
        """Lista y filtra exámenes bimestrales."""
        filtros = {}
        if 'estudiante_id' in request.query_params:
            filtros['estudiante_id'] = request.query_params['estudiante_id']
        if 'curso_id' in request.query_params:
            filtros['curso_id'] = request.query_params['curso_id']
        if 'bimestre' in request.query_params:
            filtros['bimestre'] = request.query_params['bimestre']
            
        examenes = ExamenBimestral.objects.filter(**filtros)
        serializer = ExamenBimestralSerializer(examenes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        """Registra o actualiza un examen bimestral."""
        serializer = ExamenBimestralSerializer(data=request.data)
        
        if serializer.is_valid():
            data = serializer.validated_data
            
            try:
                examen, created = ExamenBimestral.objects.update_or_create(
                    estudiante=data['estudiante'],
                    curso=data['curso'],
                    seccion=data['seccion'],
                    bimestre=data['bimestre'],
                    defaults={'calificacion_examen': data['calificacion_examen']}
                )
            except IntegrityError:
                return Response(
                    {'detail': 'Error de integridad al guardar el examen.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            response_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
            action = "creado" if created else "actualizado"
            response_serializer = ExamenBimestralSerializer(examen)

            return Response(
                {'detail': f'Examen bimestral {action} con éxito.', 'data': response_serializer.data},
                status=response_status
            )
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CierreMensualAPIView(APIView):
    """
    Endpoint para cambiar el estado de un mes (POST) y listar los estados (GET).
    """

    def get(self, request, *args, **kwargs):
        """Lista estados de cierre mensual con filtros opcionales."""
        filtros = {}
        if 'curso_id' in request.query_params:
            filtros['curso_id'] = request.query_params['curso_id']
        if 'seccion_id' in request.query_params:
            filtros['seccion_id'] = request.query_params['seccion_id']
            
        estados = EstadoCierreMensual.objects.filter(**filtros)
        serializer = EstadoCierreMensualSerializer(estados, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        """Cambia el estado de cierre de un mes específico."""
        curso_id = request.data.get('curso_id')
        seccion_id = request.data.get('seccion_id')
        mes = request.data.get('mes')
        nuevo_estado = request.data.get('estado', 'CERRADO')
        usuario_id = request.data.get('usuario_id') 

        if not all([curso_id, seccion_id, mes, usuario_id]):
            return Response(
                {'detail': 'Faltan parámetros: curso_id, seccion_id, mes, usuario_id.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Obtener o crear el registro de estado
            estado_cierre, created = EstadoCierreMensual.objects.get_or_create(
                curso_id=curso_id,
                seccion_id=seccion_id,
                mes=mes,
                defaults={'estado': 'ABIERTO'}
            )
            
            # Actualizar estado y trazabilidad
            estado_cierre.estado = nuevo_estado
            estado_cierre.fecha_cierre = timezone.now()
            estado_cierre.cerrado_por_id = usuario_id
            estado_cierre.save()
            
            # Registro de auditoría
            registrar_evento_auditoria(
                usuario_id=usuario_id,
                evento=f'CIERRE_MES_{nuevo_estado}_APLICADO',
                detalles={'curso': curso_id, 'seccion': seccion_id, 'mes': mes}
            )

            return Response(
                {'detail': f'Cierre mensual actualizado a estado: {nuevo_estado}. Trazabilidad y Auditoría registradas.'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'detail': f'Error al procesar el cierre: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PromedioBimestralAPIView(APIView):
    """
    Endpoint para calcular el promedio bimestral aplicando la regla 50-50.
    """

    def get(self, request, *args, **kwargs):
        """Calcula el promedio bimestral de un estudiante."""
        estudiante_id = request.query_params.get('estudiante_id')
        curso_id = request.query_params.get('curso_id')
        seccion_id = request.query_params.get('seccion_id')
        bimestre = request.query_params.get('bimestre')

        if not all([estudiante_id, curso_id, seccion_id, bimestre]):
            return Response(
                {'detail': 'Faltan parámetros requeridos.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            bimestre = int(bimestre)
        except ValueError:
            return Response(
                {'detail': 'El parámetro bimestre debe ser un número entero.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Obtener notas mensuales
        mes = bimestre  # Lógica simplificada
        notas_queryset = NotaMensual.objects.filter(
            estudiante_id=estudiante_id,
            curso_id=curso_id,
            seccion_id=seccion_id,
            mes=mes
        ).values_list('calificacion', flat=True)
        
        notas_list = list(notas_queryset)
        
        # Calcular promedio mensual
        promedio_mensual = calcular_promedio_mensual(notas_list)
        
        # Obtener calificación del examen bimestral
        try:
            examen = ExamenBimestral.objects.get(
                estudiante_id=estudiante_id,
                curso_id=curso_id,
                seccion_id=seccion_id,
                bimestre=bimestre
            )
            calificacion_examen = examen.calificacion_examen
        except ExamenBimestral.DoesNotExist:
            calificacion_examen = Decimal('0.00') 
            
        # Calcular promedio bimestral con regla 50-50
        promedio_final_bimestral = calcular_promedio_bimestral(promedio_mensual, calificacion_examen)
        
        return Response({
            'estudiante_id': estudiante_id,
            'bimestre': bimestre,
            'promedio_mensual_calculado': str(promedio_mensual),
            'calificacion_examen_obtenida': str(calificacion_examen),
            'promedio_final_bimestral_50_50': str(promedio_final_bimestral)
        }, status=status.HTTP_200_OK)


# ViewSets de solo lectura para referencias
class CursoViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet de solo lectura para listar cursos."""
    queryset = Curso.objects.all()
    serializer_class = CursoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class SeccionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet de solo lectura para listar secciones."""
    queryset = Seccion.objects.all()
    serializer_class = SeccionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]