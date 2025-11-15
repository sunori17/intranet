#!/usr/bin/env python
"""
Script para poblar la base de datos SQLite con datos de prueba
para verificar que funciona el sistema de generación de PDFs.
"""
import os
import django
from pathlib import Path

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'intranet.settings')
django.setup()

from apps.libretas.models import Alumno, Asignatura, AsignaturaTrabajada, Nota

# Limpiar datos existentes
print("Limpiando datos existentes...")
Nota.objects.all().delete()
AsignaturaTrabajada.objects.all().delete()
Asignatura.objects.all().delete()
Alumno.objects.all().delete()

print("✓ Base de datos limpia")

# === CREAR ASIGNATURAS ===
print("\nCreando asignaturas...")
asignaturas_data = [
    # Inicial
    {"area": "COMUNICACIÓN", "nombre": "COMUNICACIÓN", "cant_horas": 2},
    {"area": "MATEMÁTICA", "nombre": "MATEMÁTICA", "cant_horas": 2},
    {"area": "CIENCIA Y AMBIENTE", "nombre": "CIENCIA Y AMBIENTE", "cant_horas": 1},
    {"area": "PERSONAL SOCIAL", "nombre": "PERSONAL SOCIAL", "cant_horas": 1},
    
    # Primaria / Secundaria
    {"area": "MATEMÁTICA", "nombre": "ARITMÉTICA", "cant_horas": 3},
    {"area": "MATEMÁTICA", "nombre": "ÁLGEBRA", "cant_horas": 2},
    {"area": "MATEMÁTICA", "nombre": "GEOMETRÍA", "cant_horas": 2},
    {"area": "MATEMÁTICA", "nombre": "RAZ. MATEMÁTICO", "cant_horas": 2},
    
    {"area": "COMUNICACIÓN INTEGRAL", "nombre": "GRAMÁTICA", "cant_horas": 2},
    {"area": "COMUNICACIÓN INTEGRAL", "nombre": "ORTOGRAFÍA", "cant_horas": 1},
    {"area": "COMUNICACIÓN INTEGRAL", "nombre": "COMP. LECTORA", "cant_horas": 2},
    {"area": "COMUNICACIÓN INTEGRAL", "nombre": "RAZ. VERBAL", "cant_horas": 1},
    
    {"area": "CIENCIA Y TECNOLOGÍA", "nombre": "BIOLOGÍA", "cant_horas": 2},
    {"area": "CIENCIA Y TECNOLOGÍA", "nombre": "FÍSICA", "cant_horas": 2},
    
    {"area": "PERSONAL SOCIAL", "nombre": "HISTORIA", "cant_horas": 2},
    {"area": "PERSONAL SOCIAL", "nombre": "GEOGRAFÍA", "cant_horas": 2},
    
    {"area": "EDUCACIÓN FÍSICA", "nombre": "EDUCACIÓN FÍSICA", "cant_horas": 2},
    {"area": "EDUCACIÓN POR EL ARTE", "nombre": "EDUCACIÓN ARTÍSTICA", "cant_horas": 1},
    {"area": "EDUCACIÓN RELIGIOSA", "nombre": "EDUCACIÓN RELIGIOSA", "cant_horas": 1},
    {"area": "INGLÉS", "nombre": "INGLÉS", "cant_horas": 2},
    {"area": "COMPUTACIÓN", "nombre": "COMPUTACIÓN", "cant_horas": 1},
    {"area": "CONDUCTA", "nombre": "CONDUCTA", "cant_horas": 0},
]

asignaturas = {}
for i, data in enumerate(asignaturas_data, 1):
    asig = Asignatura.objects.create(
        idasignatura=i,
        area=data["area"],
        nombre=data["nombre"],
        cant_horas=data["cant_horas"]
    )
    asignaturas[data["nombre"]] = asig
    print(f"  ✓ {data['area']} - {data['nombre']}")

# === CREAR ALUMNOS ===
print("\nCreando alumnos...")

alumnos_inicial = [
    ("GARCÍA López", "Juan", 3, 1),
    ("MARTÍNEZ SÁNCHEZ", "María", 3, 1),
    ("RODRÍGUEZ PÉREZ", "Carlos", 3, 1),
]

alumnos_primaria = [
    ("TORRES GUTIERREZ", "Ana", 4, 1),
    ("FLORES RUIZ", "Miguel", 4, 1),
    ("VARGAS MENDOZA", "Paula", 4, 1),
    ("CASTILLO ROMERO", "Diego", 4, 1),
]

alumnos_secundaria = [
    ("MORALES SILVA", "Andrea", 2, 1),  # 2do de secundaria
    ("QUISPE CONDORI", "Roberto", 2, 1),
    ("SALAZAR VILLENA", "Sofía", 2, 1),
]

alumno_id = 1
alumnos_by_grado = {}

for apellidos, nombres, grado, seccion in alumnos_inicial + alumnos_primaria + alumnos_secundaria:
    alumno = Alumno.objects.create(
        idalumno=alumno_id,
        nombres=nombres,
        apellidos=apellidos,
        edad=5 + grado if grado <= 3 else 12 + (grado - 4),
        dni=f"123456{alumno_id:03d}",
        idgrado_trabajado=grado,
        idpadre=None
    )
    alumnos_by_grado.setdefault(grado, []).append(alumno)
    print(f"  ✓ {apellidos}, {nombres} (Grado {grado})")
    alumno_id += 1

# === CREAR ASIGNATURAS TRABAJADAS ===
print("\nCreando asignaturas trabajadas...")
asig_trabajada_id = 1
asig_trabajadas_by_grado = {}

# Para grado 3 (Inicial): solo algunas asignaturas
asig_inicial = ["COMUNICACIÓN", "MATEMÁTICA", "CIENCIA Y AMBIENTE", "PERSONAL SOCIAL"]
for grado in [3]:  # Inicial
    asig_trabajadas_by_grado[grado] = []
    for nombre in asig_inicial:
        asig = asignaturas[nombre]
        at = AsignaturaTrabajada.objects.create(
            idasignatura_trabajada=asig_trabajada_id,
            idgrado_trabajado=grado,
            idprofesor=1,
            idasignatura=asig
        )
        asig_trabajadas_by_grado[grado].append(at)
        asig_trabajada_id += 1

# Para grado 4 (Primaria): asignaturas de primaria
asig_primaria = [
    "ARITMÉTICA", "ÁLGEBRA", "GEOMETRÍA", "RAZ. MATEMÁTICO",
    "GRAMÁTICA", "ORTOGRAFÍA", "COMP. LECTORA", "RAZ. VERBAL",
    "BIOLOGÍA", "FÍSICA",
    "HISTORIA", "GEOGRAFÍA",
    "EDUCACIÓN FÍSICA", "EDUCACIÓN ARTÍSTICA", "EDUCACIÓN RELIGIOSA",
    "INGLÉS", "COMPUTACIÓN", "CONDUCTA"
]
for grado in [4]:  # Primaria
    asig_trabajadas_by_grado[grado] = []
    for nombre in asig_primaria:
        asig = asignaturas[nombre]
        at = AsignaturaTrabajada.objects.create(
            idasignatura_trabajada=asig_trabajada_id,
            idgrado_trabajado=grado,
            idprofesor=2,
            idasignatura=asig
        )
        asig_trabajadas_by_grado[grado].append(at)
        asig_trabajada_id += 1

# Para grado 2 (Secundaria): asignaturas de secundaria
asig_secundaria = asig_primaria  # Mismo que primaria
for grado in [2]:  # Secundaria
    asig_trabajadas_by_grado[grado] = []
    for nombre in asig_secundaria:
        asig = asignaturas[nombre]
        at = AsignaturaTrabajada.objects.create(
            idasignatura_trabajada=asig_trabajada_id,
            idgrado_trabajado=grado,
            idprofesor=3,
            idasignatura=asig
        )
        asig_trabajadas_by_grado[grado].append(at)
        asig_trabajada_id += 1

print(f"  ✓ {asig_trabajada_id - 1} asignaturas trabajadas creadas")

# === CREAR NOTAS ===
print("\nCreando notas para bimestre 1 y 2...")
nota_id = 1

# Notas para INICIAL (grado 3)
for alumno in alumnos_by_grado[3]:
    for at in asig_trabajadas_by_grado[3]:
        for bimestre in [1, 2]:
            # Notas aleatorias entre 12 y 18
            import random
            calificacion = round(random.uniform(12, 18), 2)
            nota = Nota.objects.create(
                idnota=nota_id,
                calificacion=calificacion,
                nombre=f"Nota B{bimestre}",
                bimestre=bimestre,
                idasignatura_trabajada=at,
                idalumno=alumno
            )
            nota_id += 1

# Notas para PRIMARIA (grado 4)
for alumno in alumnos_by_grado[4]:
    for at in asig_trabajadas_by_grado[4]:
        for bimestre in [1, 2]:
            import random
            calificacion = round(random.uniform(13, 19), 2)
            nota = Nota.objects.create(
                idnota=nota_id,
                calificacion=calificacion,
                nombre=f"Nota B{bimestre}",
                bimestre=bimestre,
                idasignatura_trabajada=at,
                idalumno=alumno
            )
            nota_id += 1

# Notas para SECUNDARIA (grado 2)
for alumno in alumnos_by_grado[2]:
    for at in asig_trabajadas_by_grado[2]:
        for bimestre in [1, 2]:
            import random
            calificacion = round(random.uniform(14, 20), 2)
            nota = Nota.objects.create(
                idnota=nota_id,
                calificacion=calificacion,
                nombre=f"Nota B{bimestre}",
                bimestre=bimestre,
                idasignatura_trabajada=at,
                idalumno=alumno
            )
            nota_id += 1

print(f"  ✓ {nota_id - 1} notas creadas")

print("\n" + "="*60)
print("✓ BASE DE DATOS POBLADA CORRECTAMENTE")
print("="*60)
print("\nPuedes probar los endpoints con:")
print("\n1. INICIAL (Grado 3, Bimestre 1 o 2):")
print("   http://127.0.0.1:8000/libretas/bimestral/pdf?grado=3&seccion=A&bimestre=1&nivel=inicial")
print("\n2. PRIMARIA (Grado 4, Bimestre 1 o 2):")
print("   http://127.0.0.1:8000/libretas/bimestral/pdf?grado=4&seccion=A&bimestre=1&nivel=primaria")
print("\n3. SECUNDARIA (Grado 2, Bimestre 1 o 2):")
print("   http://127.0.0.1:8000/libretas/bimestral/pdf?grado=2&seccion=A&bimestre=1&nivel=secundaria")
print("\n" + "="*60)
