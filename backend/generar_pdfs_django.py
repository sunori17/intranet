#!/usr/bin/env python
"""Script para generar PDFs de los 3 niveles usando Django Test Client."""
import os
import django
import sys

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "intranet.settings")
django.setup()

from django.test import Client

# Configuración para cada nivel
niveles = [
    {"nombre": "inicial", "grado": "3", "seccion": "A", "bimestre": "1"},
    {"nombre": "primaria", "grado": "4", "seccion": "A", "bimestre": "1"},
    {"nombre": "secundaria", "grado": "2", "seccion": "A", "bimestre": "1"},
]

print("=" * 60)
print("Generando PDFs para los 3 niveles educativos")
print("=" * 60)

client = Client()

for nivel in niveles:
    print(f"\n{nivel['nombre'].upper()}:")
    print(f"  → Grado: {nivel['grado']}, Sección: {nivel['seccion']}, Bimestre: {nivel['bimestre']}")
    
    try:
        # Realizar request GET con query params
        response = client.get(
            f"/libretas/bimestral/pdf?grado={nivel['grado']}&seccion={nivel['seccion']}&bimestre={nivel['bimestre']}"
        )
        
        if response.status_code == 200:
            # Guardar PDF
            filename = f"{nivel['nombre']}.pdf"
            with open(filename, "wb") as f:
                f.write(response.content)
            
            size = len(response.content)
            print(f"  ✓ PDF generado: {filename} ({size:,} bytes)")
            
            if size < 100:
                print(f"  ⚠ ADVERTENCIA: PDF muy pequeño, posiblemente vacío")
        else:
            print(f"  ✗ Error HTTP {response.status_code}")
            content_preview = response.content[:500].decode('utf-8', errors='ignore')
            print(f"    {content_preview}")
    
    except Exception as e:
        print(f"  ✗ Error: {e}")
        import traceback
        traceback.print_exc()

print("\n" + "=" * 60)
print("Proceso completado")
print("=" * 60)
