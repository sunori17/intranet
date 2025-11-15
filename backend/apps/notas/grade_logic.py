from decimal import Decimal, ROUND_HALF_UP

PRECISION = Decimal('.01')

def calcular_promedio_mensual(notas: list) -> Decimal:
    """
    Calcula el promedio simple de una lista de notas.
    El cálculo debe redondear a 2 decimales.
    
    Args:
        notas: Lista de calificaciones (pueden ser Decimal, float o int).
        
    Returns:
        El promedio mensual como objeto Decimal.
    """
    if not notas:
        return Decimal('0.00')

    # Convertir a Decimal si no lo son
    notas_decimal = [Decimal(str(nota)) for nota in notas]
    suma = sum(notas_decimal)
    promedio = suma / len(notas_decimal)
    
    return promedio.quantize(PRECISION, rounding=ROUND_HALF_UP)


def calcular_promedio_bimestral(promedio_mensual: Decimal, examen_bimestral: Decimal) -> Decimal:
    """
    Calcula el promedio bimestral aplicando la regla 50-50:
    (Promedio Mensual + Examen Bimestral) / 2.
    
    Args:
        promedio_mensual: Promedio de las notas mensuales (Decimal).
        examen_bimestral: Calificación del examen bimestral (Decimal).
        
    Returns:
        El promedio bimestral final como objeto Decimal.
    """
    if not isinstance(promedio_mensual, Decimal):
        promedio_mensual = Decimal(str(promedio_mensual))
    if not isinstance(examen_bimestral, Decimal):
        examen_bimestral = Decimal(str(examen_bimestral))

    promedio_final = (promedio_mensual + examen_bimestral) / 2
    return promedio_final.quantize(PRECISION, rounding=ROUND_HALF_UP)


def redondear_para_libreta(promedio: Decimal) -> int:
    """
    Aplica el redondeo comercial para libretas: 14.5 → 15, 14.4 → 14.
    
    Args:
        promedio: Nota como Decimal
        
    Returns:
        Nota redondeada como entero
    """
    if not isinstance(promedio, Decimal):
        promedio = Decimal(str(promedio))
    
    # ROUND_HALF_UP: 14.5 → 15, 14.4 → 14
    return int(promedio.quantize(Decimal('1'), rounding=ROUND_HALF_UP))


def nota_a_letra(promedio: Decimal) -> str:
    """
    Convierte promedio numérico a letra según escala UGEL.
    
    Args:
        promedio: Nota numérica
        
    Returns:
        Letra (AD, A, B, C)
    """
    nota_redondeada = redondear_para_libreta(promedio)
    
    if nota_redondeada >= 18:
        return "AD"
    elif nota_redondeada >= 14:
        return "A"
    elif nota_redondeada >= 11:
        return "B"
    else:
        return "C"