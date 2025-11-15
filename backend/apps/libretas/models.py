from django.db import models


class Alumno(models.Model):
    idalumno = models.IntegerField(primary_key=True, db_column='idalumno')
    codigougel = models.IntegerField(null=True, blank=True, db_column='codigougel')
    nombres = models.CharField(max_length=100, db_column='nombres')
    apellidos = models.CharField(max_length=100, db_column='apellidos')
    edad = models.IntegerField(null=True, blank=True, db_column='edad')
    dni = models.CharField(max_length=15, unique=True, db_column='dni')
    idgrado_trabajado = models.IntegerField(null=True, blank=True, db_column='idgrado_trabajado')
    idpadre = models.IntegerField(null=True, blank=True, db_column='idpadre')

    class Meta:
        db_table = "alumno"
        managed = True

    def __str__(self):
        return f"{self.apellidos}, {self.nombres}"


class Asignatura(models.Model):
    idasignatura = models.IntegerField(primary_key=True, db_column='idasignatura')
    area = models.CharField(max_length=50, db_column='area')
    nombre = models.CharField(max_length=50, db_column='nombre')
    cant_horas = models.IntegerField(null=True, blank=True, db_column='cant_horas')

    class Meta:
        db_table = "asignatura"
        managed = True

    def __str__(self):
        return self.nombre


class AsignaturaTrabajada(models.Model):
    idasignatura_trabajada = models.IntegerField(primary_key=True, db_column='idasignatura_trabajada')
    idgrado_trabajado = models.IntegerField(null=True, blank=True, db_column='idgrado_trabajado')
    idprofesor = models.IntegerField(null=True, blank=True, db_column='idprofesor')
    idasignatura = models.ForeignKey(Asignatura, db_column='idasignatura', on_delete=models.DO_NOTHING, related_name='trabajadas')

    class Meta:
        db_table = "asignatura_trabajada"
        managed = True


class Nota(models.Model):
    idnota = models.IntegerField(primary_key=True, db_column='idnota')
    calificacion = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, db_column='calificacion')
    nombre = models.CharField(max_length=50, null=True, blank=True, db_column='nombre')
    bimestre = models.IntegerField(db_column='bimestre')
    idasignatura_trabajada = models.ForeignKey(AsignaturaTrabajada, db_column='idasignatura_trabajada', on_delete=models.DO_NOTHING, related_name='notas')
    idalumno = models.ForeignKey(Alumno, db_column='idalumno', on_delete=models.DO_NOTHING, related_name='notas')

    class Meta:
        db_table = "nota"
        managed = True


class Boleta(models.Model):
    IdBoleta = models.IntegerField(primary_key=True)
    IdAlumno = models.ForeignKey(Alumno, db_column='IdAlumno', on_delete=models.DO_NOTHING, related_name='boletas')
    IdGrado_trabajado = models.IntegerField(null=True, blank=True)
    IdTutor = models.IntegerField(null=True, blank=True)
    Anio = models.IntegerField()
    Promedio_Final_General = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    Comentarios_Tutor = models.TextField(null=True, blank=True)
    Fecha_Emision = models.DateField(null=True, blank=True)

    class Meta:
        db_table = "boleta"
        managed = True

    def __str__(self):
        return f"Boleta {self.IdBoleta} - Alumno {self.IdAlumno}"
