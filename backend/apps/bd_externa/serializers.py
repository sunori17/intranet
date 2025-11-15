from rest_framework import serializers
from .models import MySQLConnection, SyncLog


class MySQLConnectionSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)  # No exponer passwords en GET
    
    class Meta:
        model = MySQLConnection
        fields = [
            'id', 'name', 'host', 'port', 'database', 
            'username', 'password', 'active', 'created_at'
        ]
        read_only_fields = ['created_at']


class SyncLogSerializer(serializers.ModelSerializer):
    connection_name = serializers.CharField(source='connection.name', read_only=True)
    duration_seconds = serializers.SerializerMethodField()
    
    class Meta:
        model = SyncLog
        fields = [
            'id', 'connection_name', 'operation', 'status', 
            'records_processed', 'error_message', 
            'started_at', 'finished_at', 'duration_seconds'
        ]
    
    def get_duration_seconds(self, obj):
        if obj.finished_at and obj.started_at:
            return (obj.finished_at - obj.started_at).total_seconds()
        return None


class StudentSyncSerializer(serializers.Serializer):
    """Serializer para sincronizar datos de estudiante con MySQL."""
    codigo_ugel = serializers.IntegerField(min_value=1)
    nombres = serializers.CharField(max_length=100)
    apellidos = serializers.CharField(max_length=100)
    edad = serializers.IntegerField(min_value=3, max_value=100)
    dni = serializers.CharField(max_length=8, min_length=8)
    id_grado_trabajado = serializers.IntegerField(min_value=1)
    id_padre = serializers.IntegerField(min_value=1)


class GradeSyncSerializer(serializers.Serializer):
    """Serializer para sincronizar datos de notas con MySQL."""
    id_alumno = serializers.IntegerField(min_value=1)
    id_asignatura_trabajada = serializers.IntegerField(min_value=1)
    calificacion = serializers.DecimalField(max_digits=4, decimal_places=2, min_value=0, max_value=20)
    nombre_nota = serializers.CharField(max_length=200)
    bimestre = serializers.IntegerField(min_value=1, max_value=4)


class BoletaSyncSerializer(serializers.Serializer):
    """Serializer para sincronizar boletas con MySQL."""
    id_boleta = serializers.IntegerField(min_value=1)
    id_asignatura_trabajada = serializers.IntegerField(min_value=1)
    bimestre = serializers.IntegerField(min_value=1, max_value=4)
    promedio_bimestral = serializers.DecimalField(max_digits=4, decimal_places=2, min_value=0, max_value=20)