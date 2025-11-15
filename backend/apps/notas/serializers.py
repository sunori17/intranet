from rest_framework import serializers
from .models import NotaMensual, ExamenBimestral, EstadoCierreMensual, Curso, Seccion
from decimal import Decimal
from django.contrib.auth import get_user_model

# Obtener el modelo de usuario
User = get_user_model()


class EstudianteSerializer(serializers.ModelSerializer):
    """Información básica del estudiante para evitar enviar el objeto completo."""
    class Meta:
        model = User
        fields = ['id', 'username'] 


class CursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Curso
        fields = ['id', 'nombre']


class SeccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seccion
        fields = ['id', 'nombre']


class NotaMensualSerializer(serializers.ModelSerializer):
    # Campos de solo lectura con información expandida
    estudiante_info = EstudianteSerializer(source='estudiante', read_only=True)
    curso_info = CursoSerializer(source='curso', read_only=True)
    seccion_info = SeccionSerializer(source='seccion', read_only=True)
    
    # Validación de rango para calificaciones
    calificacion = serializers.DecimalField(
        max_digits=4, 
        decimal_places=2, 
        min_value=Decimal('0.00'), 
        max_value=Decimal('20.00')
    )
    
    class Meta:
        model = NotaMensual
        fields = (
            'id', 
            # IDs de FK para escritura (POST/PUT)
            'estudiante', 'curso', 'seccion',
            'mes', 'calificacion',
            # Objetos expandidos para lectura (GET)
            'estudiante_info', 'curso_info', 'seccion_info',
        )
        
        # Los IDs están disponibles solo para escritura
        extra_kwargs = {
            'estudiante': {'write_only': True},
            'curso': {'write_only': True},
            'seccion': {'write_only': True},
        }


class ExamenBimestralSerializer(serializers.ModelSerializer):
    # Campos de solo lectura con información expandida
    estudiante_info = EstudianteSerializer(source='estudiante', read_only=True)
    curso_info = CursoSerializer(source='curso', read_only=True)
    seccion_info = SeccionSerializer(source='seccion', read_only=True)
    
    # Validación de rango para calificaciones de examen
    calificacion_examen = serializers.DecimalField(
        max_digits=4, 
        decimal_places=2, 
        min_value=Decimal('0.00'), 
        max_value=Decimal('20.00')
    )
    
    class Meta:
        model = ExamenBimestral
        fields = (
            'id', 
            # IDs de FK para escritura (POST/PUT)
            'estudiante', 'curso', 'seccion', 
            'bimestre', 'calificacion_examen',
            # Objetos expandidos para lectura (GET)
            'estudiante_info', 'curso_info', 'seccion_info',
        )

        # Los IDs están disponibles solo para escritura
        extra_kwargs = {
            'estudiante': {'write_only': True},
            'curso': {'write_only': True},
            'seccion': {'write_only': True},
        }


class EstadoCierreMensualSerializer(serializers.ModelSerializer):
    curso_info = CursoSerializer(source='curso', read_only=True)
    seccion_info = SeccionSerializer(source='seccion', read_only=True)
    cerrado_por_info = EstudianteSerializer(source='cerrado_por', read_only=True)

    class Meta:
        model = EstadoCierreMensual
        fields = [
            'id',
            # IDs de FK para escritura
            'curso', 'seccion', 'cerrado_por',
            'mes', 'estado', 'fecha_cierre',
            # Info expandida para lectura
            'curso_info', 'seccion_info', 'cerrado_por_info',
        ]
        extra_kwargs = {
            'curso': {'write_only': True},
            'seccion': {'write_only': True},
            'cerrado_por': {'write_only': True, 'required': False},
        }