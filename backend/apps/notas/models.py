from django.db import models
from django.conf import settings
from decimal import Decimal
from django.contrib.auth.models import User

class Curso(models.Model):
    """Modelo para cursos/asignaturas."""
    nombre = models.CharField(max_length=100)
    codigo = models.CharField(max_length=20, unique=True, null=True, blank=True)
    
    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name_plural = "Cursos"


class Seccion(models.Model):
    """Modelo para secciones."""
    nombre = models.CharField(max_length=50)
    grado = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name_plural = "Secciones"


ESTADOS_CIERRE = (
    ('ABIERTO', 'Abierto para Edición'),
    ('REVISION', 'En Proceso de Revisión'),
    ('CERRADO', 'Cerrado y Bloqueado'),
)


class Rubro(models.Model):
    """Define una categoría de evaluación (e.g., Tareas, Participación)."""
    nombre = models.CharField(max_length=100, unique=True)
    peso_porcentual = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('1.00'),
        help_text="Peso en el promedio (e.g., 0.20 para 20%)"
    )

    def __str__(self):
        return self.nombre
    
    class Meta:
        verbose_name_plural = "Rubros"


class NotaMensual(models.Model):
    """Almacena la calificación individual de un estudiante en un rubro específico."""
    estudiante = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notas_mensuales') 
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE) 
    seccion = models.ForeignKey(Seccion, on_delete=models.CASCADE) 
    rubro = models.ForeignKey(Rubro, on_delete=models.CASCADE)
    
    mes = models.IntegerField(help_text="1 a 12")
    calificacion = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Calificación de 0.00 a 20.00"
    )

    class Meta:
        unique_together = ('estudiante', 'curso', 'seccion', 'rubro', 'mes')
        verbose_name = "Nota Mensual"
        verbose_name_plural = "Notas Mensuales"

    def __str__(self):
        return f"{self.estudiante} - {self.curso} - {self.calificacion}"


class ExamenBimestral(models.Model):
    """Almacena la calificación del examen bimestral."""
    estudiante = models.ForeignKey(User, on_delete=models.CASCADE, related_name='examenes_bimestrales') 
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE)
    seccion = models.ForeignKey(Seccion, on_delete=models.CASCADE)
    
    bimestre = models.IntegerField(help_text="1 a 4")
    calificacion_examen = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Calificación del examen bimestral de 0.00 a 20.00"
    )

    class Meta:
        unique_together = ('estudiante', 'curso', 'seccion', 'bimestre')
        verbose_name = "Examen Bimestral"
        verbose_name_plural = "Exámenes Bimestrales"

    def __str__(self):
        return f"{self.estudiante} - {self.curso} - B{self.bimestre}: {self.calificacion_examen}"


class EstadoCierreMensual(models.Model):
    """Controla si las notas de un mes/sección/curso están abiertas o cerradas."""
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE)
    seccion = models.ForeignKey(Seccion, on_delete=models.CASCADE)
    
    mes = models.IntegerField()
    estado = models.CharField(
        max_length=10,
        choices=ESTADOS_CIERRE,
        default='ABIERTO',
        help_text="Estado de las notas: ABIERTO, REVISION o CERRADO."
    )
    fecha_cierre = models.DateTimeField(null=True, blank=True)
    cerrado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        unique_together = ('curso', 'seccion', 'mes')
        verbose_name = "Estado Cierre Mensual"
        verbose_name_plural = "Estados Cierre Mensual"

    def __str__(self):
        return f"{self.curso} - {self.seccion} - Mes {self.mes}: {self.estado}"