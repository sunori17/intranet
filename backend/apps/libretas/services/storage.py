"""
Helpers para almacenamiento temporal de archivos UGEL.
"""
from __future__ import annotations
import os
import uuid
from pathlib import Path
from django.conf import settings


def get_tmp_dir() -> Path:
    """
    Retorna el directorio temporal para uploads UGEL.
    Crea el directorio si no existe.
    """
    d = Path(getattr(settings, "UPLOAD_TMP_DIR", "/tmp/ugel"))
    d.mkdir(parents=True, exist_ok=True)
    return d


def save_upload(django_file) -> tuple[str, str]:
    """
    Guarda el archivo subido en UPLOAD_TMP_DIR con un prefijo UUID.
    
    Args:
        django_file: Archivo de Django (request.FILES['file'])
    
    Returns:
        (token, original_filename): El token es la ruta absoluta completa.
    """
    original = django_file.name
    tmp_dir = get_tmp_dir()
    token = f"{uuid.uuid4()}_{original}"
    path = tmp_dir / token
    
    with open(path, "wb") as out:
        for chunk in django_file.chunks():
            out.write(chunk)
    
    return (str(path), original)


def resolve_original_filename(token: str) -> str:
    """
    Extrae el nombre original a partir del token.
    
    Si el token es una ruta completa tipo: /tmp/ugel/<uuid>_<original>
    extrae solo <original>.
    
    Si el token es solo <uuid>_<original>, extrae <original>.
    
    Args:
        token: Ruta completa o nombre con UUID
    
    Returns:
        original_filename
    """
    base = os.path.basename(token)
    parts = base.split("_", 1)
    return parts[1] if len(parts) == 2 else base
