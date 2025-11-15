from django.db import models


class Alumno(models.Model):
    idalumno = models.AutoField(primary_key=True)
    codigougel = models.IntegerField(blank=True, null=True)
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    edad = models.IntegerField(blank=True, null=True)
    dni = models.CharField(unique=True, max_length=15)
    idgrado_trabajado = models.ForeignKey('GradoTrabajado', models.DO_NOTHING, db_column='idgrado_trabajado', blank=True, null=True)
    idpadre = models.ForeignKey('Padre', models.DO_NOTHING, db_column='idpadre', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'alumno'


class AreaUgel(models.Model):
    idareaugel = models.AutoField(primary_key=True)
    nombrearea = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'area_ugel'


class Asignatura(models.Model):
    idasignatura = models.AutoField(primary_key=True)
    area = models.CharField(max_length=50)
    nombre = models.CharField(max_length=50)
    cant_horas = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'asignatura'


class AsignaturaTrabajada(models.Model):
    idasignatura_trabajada = models.AutoField(primary_key=True)
    idgrado_trabajado = models.ForeignKey('GradoTrabajado', models.DO_NOTHING, db_column='idgrado_trabajado', blank=True, null=True)
    idprofesor = models.ForeignKey('Profesor', models.DO_NOTHING, db_column='idprofesor', blank=True, null=True)
    idasignatura = models.ForeignKey(Asignatura, models.DO_NOTHING, db_column='idasignatura')

    class Meta:
        managed = False
        db_table = 'asignatura_trabajada'


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.BooleanField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.BooleanField()
    is_active = models.BooleanField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class Boleta(models.Model):
    idboleta = models.AutoField(primary_key=True)
    idalumno = models.ForeignKey(Alumno, models.DO_NOTHING, db_column='idalumno')
    idgrado_trabajado = models.ForeignKey('GradoTrabajado', models.DO_NOTHING, db_column='idgrado_trabajado')
    idtutor = models.ForeignKey('Profesor', models.DO_NOTHING, db_column='idtutor')
    anio = models.IntegerField()
    promedio_final_general = models.DecimalField(max_digits=4, decimal_places=2, blank=True, null=True)
    comentarios_tutor = models.TextField(blank=True, null=True)
    orden_merito_1b = models.IntegerField(blank=True, null=True)
    orden_merito_2b = models.IntegerField(blank=True, null=True)
    orden_merito_3b = models.IntegerField(blank=True, null=True)
    orden_merito_4b = models.IntegerField(blank=True, null=True)
    orden_merito_anual = models.IntegerField(blank=True, null=True)
    fecha_emision = models.DateField()

    class Meta:
        managed = False
        db_table = 'boleta'


class BoletaDetalle(models.Model):
    idboleta_detalle = models.AutoField(primary_key=True)
    idboleta = models.ForeignKey(Boleta, models.DO_NOTHING, db_column='idboleta')
    idasignatura_trabajada = models.ForeignKey(AsignaturaTrabajada, models.DO_NOTHING, db_column='idasignatura_trabajada')
    nota_1b = models.DecimalField(max_digits=4, decimal_places=2, blank=True, null=True)
    nota_2b = models.DecimalField(max_digits=4, decimal_places=2, blank=True, null=True)
    nota_3b = models.DecimalField(max_digits=4, decimal_places=2, blank=True, null=True)
    nota_4b = models.DecimalField(max_digits=4, decimal_places=2, blank=True, null=True)
    nota_final = models.DecimalField(max_digits=4, decimal_places=2, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'boleta_detalle'


class CompetenciaUgel(models.Model):
    idcompetenciaugel = models.AutoField(primary_key=True)
    nombrecompetencia = models.TextField(unique=True)

    class Meta:
        managed = False
        db_table = 'competencia_ugel'


class ConclusionUgel(models.Model):
    idconclusionugel = models.AutoField(primary_key=True)
    idcompetenciaugel = models.ForeignKey(CompetenciaUgel, models.DO_NOTHING, db_column='idcompetenciaugel')
    idareaugel = models.ForeignKey(AreaUgel, models.DO_NOTHING, db_column='idareaugel')
    idgrado = models.ForeignKey('Grado', models.DO_NOTHING, db_column='idgrado')
    conclusiontexto = models.TextField()

    class Meta:
        managed = False
        db_table = 'conclusion_ugel'


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.SmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class Grado(models.Model):
    idgrado = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50)
    nivel = models.CharField(max_length=50)
    anio = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'grado'


class GradoTrabajado(models.Model):
    idgrado_trabajado = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50)
    idgrado = models.ForeignKey(Grado, models.DO_NOTHING, db_column='idgrado', blank=True, null=True)
    idtutor = models.ForeignKey('Profesor', models.DO_NOTHING, db_column='idtutor', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'grado_trabajado'


class Nota(models.Model):
    idnota = models.AutoField(primary_key=True)
    calificacion = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    nombre = models.CharField(max_length=50, blank=True, null=True)
    bimestre = models.IntegerField()
    idasignatura_trabajada = models.ForeignKey(AsignaturaTrabajada, models.DO_NOTHING, db_column='idasignatura_trabajada', blank=True, null=True)
    idalumno = models.ForeignKey(Alumno, models.DO_NOTHING, db_column='idalumno', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'nota'


class NotaUgel(models.Model):
    idnotaugel = models.AutoField(primary_key=True)
    idareaugel = models.ForeignKey(AreaUgel, models.DO_NOTHING, db_column='idareaugel')
    idgrado = models.ForeignKey(Grado, models.DO_NOTHING, db_column='idgrado')
    idalumno = models.ForeignKey(Alumno, models.DO_NOTHING, db_column='idalumno')
    idprofesor = models.ForeignKey('Profesor', models.DO_NOTHING, db_column='idprofesor')
    idconclusionugel = models.ForeignKey(ConclusionUgel, models.DO_NOTHING, db_column='idconclusionugel', blank=True, null=True)
    idcompetenciaugel = models.ForeignKey(CompetenciaUgel, models.DO_NOTHING, db_column='idcompetenciaugel')
    notanumero = models.DecimalField(max_digits=5, decimal_places=2)
    notaletra = models.CharField(max_length=2)

    class Meta:
        managed = False
        db_table = 'nota_ugel'
        unique_together = (('idcompetenciaugel', 'idalumno'),)


class Padre(models.Model):
    idpadre = models.AutoField(primary_key=True)
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    dni = models.CharField(unique=True, max_length=15)
    telefono = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'padre'


class Profesor(models.Model):
    idprofesor = models.AutoField(primary_key=True)
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    dni = models.CharField(unique=True, max_length=15)
    correo = models.CharField(max_length=100, blank=True, null=True)
    contrasena = models.CharField(max_length=50, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'profesor'