from datetime import datetime

def registrar_evento_auditoria(usuario_id: int, evento: str, detalles: dict = None):
    """
    Simula el registro de un evento crítico (como un Cierre Mensual) en un log de auditoría.
    
    En un entorno real, esto guardaría un registro en un modelo de Auditoria o
    en un sistema de log externo (e.g., Elasticsearch, Sentry).
    
    Args:
        usuario_id: ID del usuario que realizó la acción.
        evento: Descripción corta del evento (e.g., "CIERRE_MES_APLICADO").
        detalles: Diccionario con datos contextuales (e.g., curso, seccion, mes).
    """
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'usuario_id': usuario_id,
        'evento': evento,
        'detalles_json': detalles or {}
    }
    
    # Registro de auditoría - en producción esto es CRÍTICO para la trazabilidad
    print(f"AUDITORÍA REGISTRADA: {log_entry}") 
    return True