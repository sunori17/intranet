#!/usr/bin/env python
"""Script para generar PDFs de los 3 niveles educativos."""
import urllib.request
import urllib.parse
import os

BASE_URL = "http://127.0.0.1:8000/libretas/bimestral/pdf"

# Configuración para cada nivel
niveles = [
    {"nombre": "inicial", "grado": "3", "seccion": "A", "bimestre": "1"},
    {"nombre": "primaria", "grado": "4", "seccion": "A", "bimestre": "1"},
    {"nombre": "secundaria", "grado": "2", "seccion": "A", "bimestre": "1"},
]

print("=" * 60)
print("Generando PDFs para los 3 niveles educativos")
print("=" * 60)

for nivel in niveles:
    print(f"\n{nivel['nombre'].upper()}:")
    print(f"  → Grado: {nivel['grado']}, Sección: {nivel['seccion']}, Bimestre: {nivel['bimestre']}")
    
    # Construir URL con parámetros
    params = {
        "grado": nivel["grado"],
        "seccion": nivel["seccion"],
        "bimestre": nivel["bimestre"]
    }
    
    try:
        # Construir URL completa con parámetros
        url_with_params = f"{BASE_URL}?{urllib.parse.urlencode(params)}"
        
        # Realizar POST request
        req = urllib.request.Request(url_with_params, method='POST')
        with urllib.request.urlopen(req) as response:
            content = response.read()
            
            # Guardar PDF
            filename = f"{nivel['nombre']}.pdf"
            with open(filename, "wb") as f:
                f.write(content)
            
            size = len(content)
            print(f"  ✓ PDF generado: {filename} ({size:,} bytes)")
            
            if size < 100:
                print(f"  ⚠ ADVERTENCIA: PDF muy pequeño, posiblemente vacío")
    
    except Exception as e:
        print(f"  ✗ Error: {e}")

print("\n" + "=" * 60)
print("Proceso completado")
print("=" * 60)
