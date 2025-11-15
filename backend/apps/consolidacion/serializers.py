from rest_framework import serializers
from .models import ConsolidadoBimestral, ConsolidadoUGEL, Bimestre, Curso
from django.contrib.auth import get_user_model

User = get_user_model()


class EstudianteSerializer(serializers.ModelSerializer):
    """Información básica del estudiante."""
    class Meta:
        model = User
        fields = ['id', 'username']


class CursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Curso
        fields = ['id', 'nombre', 'codigo']


class BimestreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bimestre
        fields = ['id', 'nombre', 'fecha_inicio', 'fecha_fin', 'cerrado']


class ConsolidadoBimestralSerializer(serializers.ModelSerializer):
    # Información expandida para lectura
    estudiante_info = EstudianteSerializer(source='estudiante', read_only=True)
    curso_info = CursoSerializer(source='curso', read_only=True)
    bimestre_info = BimestreSerializer(source='bimestre', read_only=True)
    
    class Meta:
        model = ConsolidadoBimestral
        fields = [
            'id',
            # IDs para escritura
            'estudiante', 'curso', 'bimestre',
            'promedio_mensual_1', 'promedio_mensual_2', 'examen_bimestral',
            'promedio_final', 'posicion', 'cerrado', 'fecha_calculo',
            # Información expandida para lectura
            'estudiante_info', 'curso_info', 'bimestre_info'
        ]
        extra_kwargs = {
            'estudiante': {'write_only': True},
            'curso': {'write_only': True},
            'bimestre': {'write_only': True},
        }


class ConsolidadoUGELSerializer(serializers.ModelSerializer):
    # Información expandida para lectura
    estudiante_info = EstudianteSerializer(source='estudiante', read_only=True)
    curso_info = CursoSerializer(source='curso', read_only=True)
    
    class Meta:
        model = ConsolidadoUGEL
        fields = [
            'id',
            # IDs para escritura
            'estudiante', 'curso',
            'bimestre_1', 'bimestre_2', 'bimestre_3', 'bimestre_4',
            'promedio_final', 'letra', 'posicion_curso', 'comentario', 'fecha_calculo',
            # Información expandida para lectura
            'estudiante_info', 'curso_info'
        ]
        extra_kwargs = {
            'estudiante': {'write_only': True},
            'curso': {'write_only': True},
        }


class ConsolidadoUGELReportSerializer(serializers.Serializer):
    """
    Serializer especial para reportes UGEL que usa DTOs.
    """
    id = serializers.IntegerField()
    estudiante_id = serializers.IntegerField()
    estudiante_codigo = serializers.CharField()
    estudiante_nombre = serializers.CharField()
    curso_id = serializers.IntegerField()
    curso_nombre = serializers.CharField()
    bimestre_1 = serializers.DecimalField(max_digits=4, decimal_places=2, allow_null=True)
    bimestre_2 = serializers.DecimalField(max_digits=4, decimal_places=2, allow_null=True)
    bimestre_3 = serializers.DecimalField(max_digits=4, decimal_places=2, allow_null=True)
    bimestre_4 = serializers.DecimalField(max_digits=4, decimal_places=2, allow_null=True)
    promedio_final = serializers.DecimalField(max_digits=4, decimal_places=2)
    letra = serializers.CharField()
    posicion_curso = serializers.IntegerField(allow_null=True)
    comentario = serializers.CharField()
    bimestres_disponibles = serializers.IntegerField()