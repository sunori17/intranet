from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth import get_user_model

User = get_user_model()


class Bimestre(models.Model):
    nombre = models.CharField(max_length=50)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    cerrado = models.BooleanField(default=False)
    
    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Bimestre"
        verbose_name_plural = "Bimestres"


class Curso(models.Model):
    nombre = models.CharField(max_length=100)
    codigo = models.CharField(max_length=20, unique=True)
    
    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Curso"
        verbose_name_plural = "Cursos"


class ConsolidadoBimestral(models.Model):
    """
    Consolidación de notas por bimestre para cada estudiante y curso.
    Calcula el promedio final aplicando la regla 50-50.
    """
    estudiante = models.ForeignKey(User, on_delete=models.CASCADE)
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE)
    bimestre = models.ForeignKey(Bimestre, on_delete=models.CASCADE)
    promedio_mensual_1 = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(20)]
    )
    promedio_mensual_2 = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(20)]
    )
    examen_bimestral = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(20)]
    )
    promedio_final = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(20)]
    )
    posicion = models.IntegerField(null=True, blank=True)
    cerrado = models.BooleanField(default=False)
    fecha_calculo = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['estudiante', 'curso', 'bimestre']
        verbose_name = "Consolidado Bimestral"
        verbose_name_plural = "Consolidados Bimestrales"
        ordering = ['-promedio_final']

    def __str__(self):
        return f"{self.estudiante} - {self.curso} - {self.bimestre}"


class ConsolidadoUGEL(models.Model):
    """
    Consolidación final anual para reportes UGEL con conversión a escala de letras.
    """
    LETRAS_EQUIVALENCIA = [
        ('AD', 'Logro Destacado (18-20)'),
        ('A', 'Logro Esperado (14-17)'),
        ('B', 'En Proceso (11-13)'),
        ('C', 'En Inicio (00-10)'),
    ]
    
    estudiante = models.ForeignKey(User, on_delete=models.CASCADE)
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE)
    bimestre_1 = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(20)]
    )
    bimestre_2 = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(20)]
    )
    bimestre_3 = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(20)]
    )
    bimestre_4 = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(20)]
    )
    promedio_final = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(20)]
    )
    letra = models.CharField(max_length=2, choices=LETRAS_EQUIVALENCIA, blank=True)
    posicion_curso = models.IntegerField(null=True, blank=True)
    comentario = models.TextField(blank=True)
    fecha_calculo = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['estudiante', 'curso']
        verbose_name = "Consolidado UGEL"
        verbose_name_plural = "Consolidados UGEL"
        ordering = ['-promedio_final']

    def __str__(self):
        return f"{self.estudiante} - {self.curso} - Final: {self.promedio_final} ({self.letra})"