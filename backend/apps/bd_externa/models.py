from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class MySQLConnection(models.Model):
    """
    Configuración de conexión a base de datos MySQL externa.
    """
    name = models.CharField(max_length=100, unique=True, help_text="Nombre de la conexión")
    host = models.CharField(max_length=200, default="localhost")
    port = models.IntegerField(default=3306, validators=[MinValueValidator(1), MaxValueValidator(65535)])
    database = models.CharField(max_length=100)
    username = models.CharField(max_length=100)
    password = models.CharField(max_length=200)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Conexión MySQL"
        verbose_name_plural = "Conexiones MySQL"
    
    def __str__(self):
        return f"{self.name} ({self.host}:{self.port}/{self.database})"


class SyncLog(models.Model):
    """
    Log de sincronizaciones entre Django y MySQL.
    """
    STATUS_CHOICES = [
        ('SUCCESS', 'Exitoso'),
        ('ERROR', 'Error'),
        ('PENDING', 'Pendiente'),
    ]
    
    connection = models.ForeignKey(MySQLConnection, on_delete=models.CASCADE)
    operation = models.CharField(max_length=100)  # ej: "sync_students", "sync_grades"
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    records_processed = models.IntegerField(default=0)
    error_message = models.TextField(blank=True, null=True)
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Log de Sincronización"
        verbose_name_plural = "Logs de Sincronización"
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.operation} - {self.status} ({self.started_at})"