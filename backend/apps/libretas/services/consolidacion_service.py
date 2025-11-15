from django.db.models import Avg
from ..models import Nota, Alumno


class ConsolidacionService:
    @staticmethod
    def get_letter_grade(average: float) -> str:
        """Convierte el promedio numérico a letra según la escala."""
        try:
            avg = float(average)
        except Exception:
            return "C"
        if avg >= 18:
            return "AD"
        if avg >= 14:
            return "A"
        if avg >= 11:
            return "B"
        return "C"

    @staticmethod
    def consolidar_bimestre(grado_id, seccion_id, bimestre):
        """
        Obtiene consolidaciones de notas para un grado, sección y bimestre.

        Parámetros:
        - grado_id: ID del grado (ej: 1, 2, 3, etc.)
        - seccion_id: Identificador de sección (ej: "A", "B", "C") - uso informativo
        - bimestre: Número del bimestre (1, 2, 3, 4)

        Retorna:
        - Lista de dicts con estructura:
          {
            "alumno_nombre": str,
            "asignaturas": [{"area": str, "nombre": str, "notas": list, "promedio": float, "letra": str}],
            "promedio_general": float,
            "letra_general": str,
            "recomendaciones": str
          }
        """
        # Query base: notas del bimestre con joins para alumno y asignatura_trabajada
        qs = Nota.objects.select_related("idalumno", "idasignatura_trabajada__idasignatura").filter(bimestre=bimestre)

        # Filtrar por grado si es un entero
        try:
            g = int(grado_id)
            qs = qs.filter(idalumno__idgrado_trabajado=g)
        except Exception:
            # no filtrar por grado si no es numérico
            pass

        # Agrupar por alumno
        alumnos = {}
        for n in qs:
            alumno = n.idalumno
            if alumno is None:
                continue
            aid = getattr(alumno, 'idalumno', None) or getattr(alumno, 'IdAlumno', None)
            if aid not in alumnos:
                alumnos[aid] = {"alumno": alumno, "asigs": {}}

            # resolver asignatura real si existe
            at = n.idasignatura_trabajada
            asign_obj = getattr(at, "idasignatura", None) if at is not None else None
            if asign_obj is not None:
                asig_id = getattr(asign_obj, 'idasignatura', None)
                area = getattr(asign_obj, "area", "")
                nombre = getattr(asign_obj, "nombre", "")
            else:
                asig_id = None
                area = ""
                nombre = getattr(n, "nombre", "") or ""

            entry = alumnos[aid]["asigs"].setdefault(asig_id, {"area": area, "nombre": nombre, "notas": []})
            try:
                val = float(n.calificacion) if n.calificacion is not None else 0.0
            except Exception:
                val = 0.0
            entry["notas"].append(val)

        if not alumnos:
            return []

        # Construimos un consolidado por cada alumno encontrado
        resultados = []
        for aid, data in alumnos.items():
            alumno_obj = data["alumno"]

            asignaturas = []
            proms = []
            for a_id, info in data["asigs"].items():
                notas = info["notas"]
                prom = sum(notas) / len(notas) if notas else 0.0
                asignaturas.append({
                    "area": info["area"],
                    "nombre": info["nombre"],
                    "notas": notas,
                    "promedio": round(prom, 2),
                    "letra": ConsolidacionService.get_letter_grade(prom),
                })
                proms.append(prom)

            prom_general = round(sum(proms) / len(proms), 2) if proms else 0.0
            letra_general = ConsolidacionService.get_letter_grade(prom_general)

            consolidado = {
                "alumno_nombre": f"{getattr(alumno_obj, 'apellidos', '')}, {getattr(alumno_obj, 'nombres', '')}",
                "asignaturas": asignaturas,
                "promedio_general": prom_general,
                "letra_general": letra_general,
                "recomendaciones": "",
            }
            resultados.append(consolidado)

        return resultados