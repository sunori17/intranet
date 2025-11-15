from __future__ import annotations
from django.conf import settings  # importa el toggle

def verificar_cierre_bimestre(seccion: str, bimestre: int) -> bool:
    """
    Placeholder S2 (Mock First):
    - Si USE_FAKE_DATA=True → solo valida rango 1..4
    - Si USE_FAKE_DATA=False → luego consultará la BD real
    """
    try:
        b = int(bimestre)
        return 1 <= b <= 4
    except Exception:
        return False

def verificar_examen_bimestral(seccion: str, curso: str, bimestre: int) -> bool:
    """
    Placeholder S2 (Mock First):
    - En mock: siempre pasa (True)
    - En real: valida que el curso tenga examen cargado
    """
    return True if settings.USE_FAKE_DATA else bool(curso and curso.strip())