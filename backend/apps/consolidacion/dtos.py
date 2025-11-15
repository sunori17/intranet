from dataclasses import dataclass
from decimal import Decimal
from typing import Optional, List


@dataclass
class ConsolidadoBimestralDTO:
    id: int
    estudiante_id: int
    estudiante_nombre: str
    curso_id: int
    curso_nombre: str
    bimestre_id: int
    bimestre_nombre: str
    promedio_mensual_1: Optional[Decimal]
    promedio_mensual_2: Optional[Decimal]
    examen_bimestral: Optional[Decimal]
    promedio_final: Optional[Decimal]
    posicion: Optional[int]
    cerrado: bool
    precondiciones_cumplidas: bool
    errores: List[str]


@dataclass
class ConsolidadoUGELDTO:
    id: int
    estudiante_id: int
    estudiante_codigo: str
    estudiante_nombre: str
    curso_id: int
    curso_nombre: str
    bimestre_1: Optional[Decimal]
    bimestre_2: Optional[Decimal]
    bimestre_3: Optional[Decimal]
    bimestre_4: Optional[Decimal]
    promedio_final: Decimal
    letra: str
    posicion_curso: Optional[int]
    comentario: str
    bimestres_disponibles: int


@dataclass
class PrecondicionDTO:
    cumplida: bool
    mensaje: str
    detalles: List[str]