# apps/libretas/services/pdf_dto.py
from django.conf import settings
from dataclasses import dataclass
from typing import List, Dict, Any, Optional


@dataclass
class Asignatura:
    area: str      # p.e. "MATEMÁTICA", "COMUNICACIÓN INTEGRAL", etc.
    nombre: str    # p.e. "ARITMÉTICA", "GRAMÁTICA", ...
    bimestres: List[Optional[str]]  # 5 columnas (1B,2B,3B,4B,P) como strings (o números)

@dataclass
class AlumnoDTO:
    apellidos_nombres: str
    grado: str
    nivel: str
    bimestre: int


def _blank_row(area: str, nombre: str) -> Asignatura:
    # 5 columnas vacías: 1B, 2B, 3B, 4B, P
    return Asignatura(area=area, nombre=nombre, bimestres=["", "", "", "", ""])


def _inicial_asignaturas() -> List[Asignatura]:
    # Lista exacta que pediste para INICIAL
    base = [
        ("", "COMUNICACIÓN"),
        ("", "MATEMÁTICA"),
        ("", "CIENCIA Y AMBIENTE"),
        ("", "PERSONAL SOCIAL"),
        ("", "PSICOMOTRICIDAD"),
        ("", "ARTE"),
        ("", "INGLÉS"),
        ("", "RELIGIÓN"),
    ]
    return [_blank_row(area or "INICIAL", nombre) for area, nombre in base]


def _primaria_asignaturas() -> List[Asignatura]:
    # Agrupadas por ÁREA → ASIGNATURA (según tu lista)
    grupos = {
        "MATEMÁTICA": ["ARITMÉTICA", "ÁLGEBRA", "GEOMETRÍA", "RAZONAMIENTO MATEMÁTICO"],
        "COMUNICACIÓN INTEGRAL": ["GRAMÁTICA", "ORTOGRAFÍA", "COMPRENSIÓN LECTORA", "RAZONAMIENTO VERBAL"],
        "CIENCIA Y TECNOLOGÍA": ["BIOLOGÍA", "FÍSICA"],
        "PERSONAL SOCIAL": ["HISTORIA", "GEOGRAFÍA"],
        "EDUCACIÓN FÍSICA": [],
        "EDUCACIÓN POR EL ARTE": [],
        "EDUCACIÓN RELIGIOSA": [],
        "INGLÉS": [],
        "COMPUTACIÓN": [],
        "CONDUCTA": [],
    }
    filas: List[Asignatura] = []
    for area, subs in grupos.items():
        if subs:
            for s in subs:
                filas.append(_blank_row(area, s))
        else:
            filas.append(_blank_row(area, area))  # área “plana” como asignatura
    return filas


def _secundaria_asignaturas() -> List[Asignatura]:
    grupos = {
        "MATEMÁTICA": ["ARITMÉTICA", "ÁLGEBRA", "GEOMETRÍA", "TRIGONOMETRÍA"],
        "COMUNICACIÓN INTEGRAL": ["LENGUAJE", "LITERATURA", "RAZONAMIENTO VERBAL"],
        "CIENCIA Y TECNOLOGÍA": ["BIOLOGÍA", "FÍSICA", "QUÍMICA"],
        "PERSONAL SOCIAL": ["HISTORIA", "GEOGRAFÍA"],
        "EDUCACIÓN FÍSICA": [],
        "EDUCACIÓN PARA EL TRABAJO": [],
        "FORMACIÓN CRISTIANA": [],
        "INGLÉS": [],
        "COMPUTACIÓN": [],
        "CONDUCTA": [],
    }
    filas: List[Asignatura] = []
    for area, subs in grupos.items():
        if subs:
            for s in subs:
                filas.append(_blank_row(area, s))
        else:
            filas.append(_blank_row(area, area))
    return filas


def _detectar_nivel(grado: str, nivel_override: Optional[str]) -> str:
    if nivel_override:
        return nivel_override.lower()
    # Heurística típica: 1-6 = primaria, 1ro/2do… Secundaria, "Inicial" explícito, etc.
    g = (grado or "").strip().lower()
    if any(x in g for x in ["inicial", "3 años", "4 años", "5 años"]):
        return "inicial"
    if any(x in g for x in ["1", "2", "3", "4", "5", "6"]) and "secund" not in g:
        return "primaria"
    return "secundaria"


def get_alumno_y_notas(grado: str, bimestre: int, nivel: Optional[str] = None):
    """
    Devuelve:
      alumno: dict con apellidos_nombres
      asignaturas: lista de tuplas (area, nombre, [1B,2B,3B,4B,P]) que tu template ya espera
    """
    if settings.USE_FAKE_DATA:
        alumno = {"apellidos_nombres": "Perez Huaman, Ana Sofía"}
        nivel_resuelto = _detectar_nivel(grado, nivel)
        if nivel_resuelto == "inicial":
            filas = _inicial_asignaturas()
        elif nivel_resuelto == "secundaria":
            filas = _secundaria_asignaturas()
        else:
            filas = _primaria_asignaturas()

        # Adaptar a la estructura esperada por plantillas: [(AREA, ASIGNATURA, [5 cols])]
        asignaturas = [(f.area, f.nombre, f.bimestres) for f in filas]
        return alumno, asignaturas, nivel_resuelto
    else:
        # TODO: Cuando BD real esté lista, consulta tu ORM aquí
        # Ej.: return _consultar_bd(grado, bimestre, nivel)
        raise NotImplementedError("Conectar a BD real cuando esté lista")
