import mysql.connector
from mysql.connector import Error
from decimal import Decimal
from datetime import datetime, date
from typing import Dict, List, Optional, Tuple
from .models import MySQLConnection, SyncLog
import logging

logger = logging.getLogger(__name__)


class MySQLService:
    """
    Servicio para interactuar con la base de datos MySQL externa.
    Basado en el código original de conexion.py del módulo 2.
    """
    
    def __init__(self, connection_name: str = "default"):
        """
        Inicializa el servicio con una conexión específica.
        
        Args:
            connection_name: Nombre de la conexión configurada en MySQLConnection
        """
        try:
            self.mysql_config = MySQLConnection.objects.get(
                name=connection_name, 
                active=True
            )
        except MySQLConnection.DoesNotExist:
            raise ValueError(f"No se encontró una conexión MySQL activa llamada '{connection_name}'")
        
        self.connection = None
    
    def connect(self) -> bool:
        """
        Establece conexión con la base de datos MySQL.
        
        Returns:
            True si la conexión fue exitosa, False en caso contrario
        """
        try:
            self.connection = mysql.connector.connect(
                host=self.mysql_config.host,
                port=self.mysql_config.port,
                database=self.mysql_config.database,
                user=self.mysql_config.username,
                password=self.mysql_config.password
            )
            logger.info(f"Conexión MySQL establecida: {self.mysql_config.name}")
            return True
            
        except Error as e:
            logger.error(f"Error al conectar con MySQL: {e}")
            return False
    
    def disconnect(self):
        """Cierra la conexión MySQL si está activa."""
        if self.connection and self.connection.is_connected():
            self.connection.close()
            logger.info("Conexión MySQL cerrada")
    
    def __enter__(self):
        """Context manager entry."""
        if self.connect():
            return self
        raise Exception("No se pudo establecer conexión con MySQL")
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.disconnect()
    
    def registrar_grado(self, nombre: str, nivel: str, anio: int) -> bool:
        """
        Registra un grado en la base de datos MySQL.
        
        Args:
            nombre: Nombre del grado
            nivel: Nivel educativo (inicial, primaria, secundaria)
            anio: Año académico
            
        Returns:
            True si el registro fue exitoso
        """
        # Validaciones
        if not nombre or not nombre.strip():
            logger.error("Error: El nombre no puede estar vacío.")
            return False

        if not nivel or not nivel.strip():
            logger.error("Error: El nivel no puede estar vacío.")
            return False

        nivel = nivel.strip().lower()
        if nivel not in ['inicial', 'primaria', 'secundaria']:
            logger.error(f"Error: El nivel '{nivel}' no es válido.")
            return False

        anio_actual = date.today().year
        if anio < anio_actual or anio > anio_actual + 1:
            logger.error(f"Error: El año '{anio}' es incorrecto.")
            return False
        
        try:
            cursor = self.connection.cursor()
            sql = """INSERT INTO Grado (Nombre, Nivel, Año)
                     VALUES (%s, %s, %s)"""
            datos = (nombre, nivel, anio)
            cursor.execute(sql, datos)
            self.connection.commit()
            
            logger.info(f"Grado '{nombre} - {nivel}' registrado con éxito.")
            return True
            
        except Error as e:
            logger.error(f"Error al registrar el grado: {e}")
            return False
        finally:
            if 'cursor' in locals():
                cursor.close()
    
    def registrar_alumno(self, codigo_ugel: int, nombres: str, apellidos: str, 
                        edad: int, dni: str, id_grado_trabajado: int, 
                        id_padre: int) -> Optional[int]:
        """
        Registra un alumno en la base de datos MySQL.
        
        Returns:
            ID del alumno creado o None si hubo error
        """
        # Validaciones
        if codigo_ugel <= 0:
            logger.error(f"Error: El Codigo UGEL '{codigo_ugel}' no es válido.")
            return None

        if not nombres or not nombres.strip():
            logger.error("Error: El campo 'Nombres' no puede estar vacío.")
            return None

        if not apellidos or not apellidos.strip():
            logger.error("Error: El campo 'Apellidos' no puede estar vacío.")
            return None

        if not (3 <= edad <= 100):
            logger.error(f"Error: La edad '{edad}' no es válida.")
            return None

        dni_limpio = str(dni).strip()
        if not dni_limpio.isdigit() or len(dni_limpio) != 8:
            logger.error(f"Error: El DNI '{dni}' no es válido.")
            return None
        
        try:
            cursor = self.connection.cursor()
            sql = """INSERT INTO Alumno
                     (CodigoUGEL, Nombres, Apellidos, Edad, DNI, IdGrado_trabajado, IdPadre)
                     VALUES (%s, %s, %s, %s, %s, %s, %s)"""
            
            datos_alumno = (codigo_ugel, nombres, apellidos, edad, dni, id_grado_trabajado, id_padre)
            cursor.execute(sql, datos_alumno)
            self.connection.commit()
            
            alumno_id = cursor.lastrowid
            logger.info(f"Alumno '{nombres} {apellidos}' registrado con éxito. ID: {alumno_id}")
            return alumno_id
            
        except Error as e:
            logger.error(f"Error al registrar alumno: {e}")
            return None
        finally:
            if 'cursor' in locals():
                cursor.close()
    
    def registrar_nota_simple(self, id_alumno: int, id_asignatura_trabajada: int, 
                            calificacion: float, nombre_nota: str, bimestre: int) -> bool:
        """
        Registra una nota en la base de datos MySQL.
        
        Returns:
            True si el registro fue exitoso
        """
        # Validaciones
        if not (0 <= calificacion <= 20):
            logger.error("Error: La calificación no es válida.")
            return False
        
        if not nombre_nota or not nombre_nota.strip():
            logger.error("Error: El campo 'Nombre' no puede estar vacío.")
            return False
        
        if not (1 <= bimestre <= 4):
            logger.error("Error: El bimestre no es válido.")
            return False
        
        try:
            cursor = self.connection.cursor()
            sql = """INSERT INTO Nota (IdAlumno, IdAsignatura_trabajada, Calificacion, Nombre, Bimestre)
                     VALUES (%s, %s, %s, %s, %s)"""
            
            datos = (id_alumno, id_asignatura_trabajada, calificacion, nombre_nota, bimestre)
            cursor.execute(sql, datos)
            self.connection.commit()
            
            logger.info(f"Nota '{nombre_nota}' ({calificacion}) registrada con éxito para el alumno ID:{id_alumno}.")
            return True
            
        except Error as e:
            logger.error(f"Error al registrar la nota: {e}")
            return False
        finally:
            if 'cursor' in locals():
                cursor.close()
    
    def obtener_notas_de_bimestre(self, id_alumno: int, id_asignatura_trabajada: int, 
                                 bimestre: int) -> Optional[List[Tuple]]:
        """
        Obtiene las notas de un alumno para un bimestre específico.
        
        Returns:
            Lista de tuplas (nombre_nota, calificacion) o None si hay error
        """
        if not (1 <= bimestre <= 4):
            logger.error("Error: El bimestre no es válido.")
            return None
        
        try:
            cursor = self.connection.cursor()
            sql = """
                SELECT Nombre, Calificacion
                FROM Nota
                WHERE IdAlumno = %s AND IdAsignatura_trabajada = %s AND Bimestre = %s
                ORDER BY IdNota;
            """
            
            cursor.execute(sql, (id_alumno, id_asignatura_trabajada, bimestre))
            return cursor.fetchall()
            
        except Error as e:
            logger.error(f"Error al consultar las notas: {e}")
            return None
        finally:
            if 'cursor' in locals():
                cursor.close()
    
    def crear_boleta_vacia(self, id_alumno: int) -> Optional[int]:
        """
        Crea una boleta vacía para un alumno.
        
        Returns:
            ID de la boleta creada o None si hay error
        """
        try:
            cursor = self.connection.cursor()
            anio_actual = date.today().year
            
            # Verificar si ya existe una boleta para este año
            sql_verificar = "SELECT IdBoleta FROM Boleta WHERE IdAlumno = %s AND Anio = %s"
            cursor.execute(sql_verificar, (id_alumno, anio_actual))
            boleta_existente = cursor.fetchone()
            
            if boleta_existente:
                id_boleta = boleta_existente[0]
                logger.info(f"La boleta para el alumno ID:{id_alumno} ya existe para el año {anio_actual}. ID: {id_boleta}")
                return id_boleta
            
            # Obtener datos del alumno
            cursor.execute("SELECT IdGrado_trabajado FROM Alumno WHERE IdAlumno = %s", (id_alumno,))
            resultado_grado = cursor.fetchone()
            if not resultado_grado:
                logger.error(f"Error: No se encontró el alumno con ID:{id_alumno}")
                return None
            id_grado_trabajado = resultado_grado[0]
            
            # Obtener tutor
            cursor.execute("SELECT IdTutor FROM Grado_trabajado WHERE IdGrado_trabajado = %s", (id_grado_trabajado,))
            resultado_tutor = cursor.fetchone()
            if not resultado_tutor:
                logger.error(f"Error: No se encontró un tutor para el grado trabajado ID:{id_grado_trabajado}")
                return None
            id_tutor = resultado_tutor[0]
            
            # Crear boleta
            sql_crear = """
                INSERT INTO Boleta (IdAlumno, IdGrado_trabajado, IdTutor, Anio, Fecha_Emision)
                VALUES (%s, %s, %s, %s, %s)
            """
            datos_boleta = (id_alumno, id_grado_trabajado, id_tutor, anio_actual, date.today())
            
            cursor.execute(sql_crear, datos_boleta)
            id_nueva_boleta = cursor.lastrowid
            self.connection.commit()
            
            logger.info(f"Boleta vacía creada con éxito para el alumno ID:{id_alumno}. ID: {id_nueva_boleta}")
            return id_nueva_boleta
            
        except Error as e:
            logger.error(f"Error al crear la boleta: {e}")
            if self.connection:
                self.connection.rollback()
            return None
        finally:
            if 'cursor' in locals():
                cursor.close()
    
    def actualizar_detalle_boleta(self, id_boleta: int, id_asignatura_trabajada: int, 
                                 bimestre: int, promedio_bimestral: float) -> bool:
        """
        Actualiza el detalle de una boleta con el promedio bimestral.
        
        Returns:
            True si la actualización fue exitosa
        """
        if not (1 <= bimestre <= 4):
            logger.error("Error: El bimestre no es válido.")
            return False
        
        if not (0 <= promedio_bimestral <= 20):
            logger.error("Error: El promedio bimestral no es válido.")
            return False
        
        try:
            cursor = self.connection.cursor()
            
            # Verificar si existe el detalle
            cursor.execute(
                "SELECT IdBoleta_Detalle FROM Boleta_Detalle WHERE IdBoleta = %s AND IdAsignatura_trabajada = %s", 
                (id_boleta, id_asignatura_trabajada)
            )
            resultado_detalle = cursor.fetchone()
            
            columna_bimestre = f"Nota_{bimestre}B"
            
            if resultado_detalle:
                # Actualizar detalle existente
                id_boleta_detalle = resultado_detalle[0]
                sql = f"UPDATE Boleta_Detalle SET {columna_bimestre} = %s WHERE IdBoleta_Detalle = %s"
                cursor.execute(sql, (promedio_bimestral, id_boleta_detalle))
            else:
                # Crear nuevo detalle
                sql = f"INSERT INTO Boleta_Detalle (IdBoleta, IdAsignatura_trabajada, {columna_bimestre}) VALUES (%s, %s, %s)"
                cursor.execute(sql, (id_boleta, id_asignatura_trabajada, promedio_bimestral))
                id_boleta_detalle = cursor.lastrowid
            
            # Recalcular promedio final de la asignatura
            sql_promedio_asignatura = """
                UPDATE Boleta_Detalle SET Nota_Final = (
                    (COALESCE(Nota_1B, 0) + COALESCE(Nota_2B, 0) + COALESCE(Nota_3B, 0) + COALESCE(Nota_4B, 0)) /
                    (CASE WHEN Nota_1B IS NOT NULL THEN 1 ELSE 0 END +
                     CASE WHEN Nota_2B IS NOT NULL THEN 1 ELSE 0 END +
                     CASE WHEN Nota_3B IS NOT NULL THEN 1 ELSE 0 END +
                     CASE WHEN Nota_4B IS NOT NULL THEN 1 ELSE 0 END)
                ) WHERE IdBoleta_Detalle = %s
            """
            cursor.execute(sql_promedio_asignatura, (id_boleta_detalle,))
            
            self.connection.commit()
            logger.info(f"Detalle de boleta actualizado con éxito - Bimestre {bimestre}: {promedio_bimestral}")
            return True
            
        except Error as e:
            logger.error(f"Error al actualizar el detalle de la boleta: {e}")
            if self.connection:
                self.connection.rollback()
            return False
        finally:
            if 'cursor' in locals():
                cursor.close()


class MySQLSyncService:
    """
    Servicio para sincronizar datos entre Django y MySQL.
    """
    
    def __init__(self, connection_name: str = "default"):
        self.connection_name = connection_name
    
    def sync_student_data(self, student_data: Dict) -> bool:
        """
        Sincroniza datos de un estudiante con MySQL.
        
        Args:
            student_data: Diccionario con datos del estudiante
            
        Returns:
            True si la sincronización fue exitosa
        """
        log = SyncLog.objects.create(
            connection=MySQLConnection.objects.get(name=self.connection_name),
            operation="sync_student_data"
        )
        
        try:
            with MySQLService(self.connection_name) as mysql:
                alumno_id = mysql.registrar_alumno(
                    codigo_ugel=student_data['codigo_ugel'],
                    nombres=student_data['nombres'],
                    apellidos=student_data['apellidos'],
                    edad=student_data['edad'],
                    dni=student_data['dni'],
                    id_grado_trabajado=student_data['id_grado_trabajado'],
                    id_padre=student_data['id_padre']
                )
                
                if alumno_id:
                    log.status = 'SUCCESS'
                    log.records_processed = 1
                    log.finished_at = datetime.now()
                    log.save()
                    return True
                else:
                    raise Exception("No se pudo registrar el alumno")
                    
        except Exception as e:
            log.status = 'ERROR'
            log.error_message = str(e)
            log.finished_at = datetime.now()
            log.save()
            logger.error(f"Error en sincronización de estudiante: {e}")
            return False
    
    def sync_grade_data(self, grade_data: Dict) -> bool:
        """
        Sincroniza datos de notas con MySQL.
        
        Args:
            grade_data: Diccionario con datos de la nota
            
        Returns:
            True si la sincronización fue exitosa
        """
        log = SyncLog.objects.create(
            connection=MySQLConnection.objects.get(name=self.connection_name),
            operation="sync_grade_data"
        )
        
        try:
            with MySQLService(self.connection_name) as mysql:
                success = mysql.registrar_nota_simple(
                    id_alumno=grade_data['id_alumno'],
                    id_asignatura_trabajada=grade_data['id_asignatura_trabajada'],
                    calificacion=float(grade_data['calificacion']),
                    nombre_nota=grade_data['nombre_nota'],
                    bimestre=grade_data['bimestre']
                )
                
                if success:
                    log.status = 'SUCCESS'
                    log.records_processed = 1
                    log.finished_at = datetime.now()
                    log.save()
                    return True
                else:
                    raise Exception("No se pudo registrar la nota")
                    
        except Exception as e:
            log.status = 'ERROR'
            log.error_message = str(e)
            log.finished_at = datetime.now()
            log.save()
            logger.error(f"Error en sincronización de nota: {e}")
            return False