from decimal import Decimal, ROUND_HALF_UP
from django.db.models import Q
from .models import ConsolidadoBimestral, ConsolidadoUGEL, Bimestre, Curso
from .dtos import ConsolidadoBimestralDTO, ConsolidadoUGELDTO, PrecondicionDTO
from django.contrib.auth import get_user_model

User = get_user_model()


class ConsolidacionService:
    
    @staticmethod
    def calcular_equivalencia_letra(promedio: Decimal) -> str:
        """
        Calcula la equivalencia literal según las reglas UGEL.
        AD: 18-20, A: 14-17, B: 11-13, C: 0-10
        """
        if promedio >= 18:
            return 'AD'
        elif promedio >= 14:
            return 'A'
        elif promedio >= 11:
            return 'B'
        else:
            return 'C'
    
    @staticmethod
    def verificar_precondiciones_bimestre(estudiante_id: int, curso_id: int, bimestre_id: int) -> PrecondicionDTO:
        """
        Verifica precondiciones para consolidar un bimestre.
        """
        errores = []
        detalles = []
        
        # Verificar si el bimestre está cerrado
        try:
            bimestre = Bimestre.objects.get(id=bimestre_id)
            if not bimestre.cerrado:
                errores.append("El bimestre no está cerrado")
            else:
                detalles.append("Bimestre: Cerrado")
        except Bimestre.DoesNotExist:
            errores.append("Bimestre no encontrado")
        
        # Verificar datos mínimos disponibles
        # En este caso, asumimos que las notas vienen del módulo notas
        detalles.append("Notas disponibles para consolidación")
        
        cumplida = len(errores) == 0
        mensaje = "Precondiciones cumplidas" if cumplida else "Faltan precondiciones"
        
        return PrecondicionDTO(
            cumplida=cumplida,
            mensaje=mensaje,
            detalles=detalles
        )
    
    @staticmethod
    def consolidar_bimestre(estudiante_id: int, curso_id: int, bimestre_id: int, 
                          promedio_mensual: Decimal, examen_bimestral: Decimal) -> ConsolidadoBimestralDTO:
        """
        Consolida las notas de un bimestre específico aplicando la regla 50-50.
        """
        # Verificar precondiciones
        precondiciones = ConsolidacionService.verificar_precondiciones_bimestre(
            estudiante_id, curso_id, bimestre_id
        )
        
        try:
            estudiante = User.objects.get(id=estudiante_id)
            curso = Curso.objects.get(id=curso_id)
            bimestre = Bimestre.objects.get(id=bimestre_id)
        except (User.DoesNotExist, Curso.DoesNotExist, Bimestre.DoesNotExist):
            return ConsolidadoBimestralDTO(
                id=0,
                estudiante_id=estudiante_id,
                estudiante_nombre="No encontrado",
                curso_id=curso_id,
                curso_nombre="No encontrado",
                bimestre_id=bimestre_id,
                bimestre_nombre="No encontrado",
                promedio_mensual_1=None,
                promedio_mensual_2=None,
                examen_bimestral=None,
                promedio_final=None,
                posicion=None,
                cerrado=False,
                precondiciones_cumplidas=False,
                errores=["Datos no encontrados"]
            )
        
        if not precondiciones.cumplida:
            return ConsolidadoBimestralDTO(
                id=0,
                estudiante_id=estudiante_id,
                estudiante_nombre=str(estudiante),
                curso_id=curso_id,
                curso_nombre=curso.nombre,
                bimestre_id=bimestre_id,
                bimestre_nombre=bimestre.nombre,
                promedio_mensual_1=None,
                promedio_mensual_2=None,
                examen_bimestral=None,
                promedio_final=None,
                posicion=None,
                cerrado=False,
                precondiciones_cumplidas=False,
                errores=precondiciones.detalles
            )
        
        # Calcular promedio final con regla 50-50
        promedio_final = (promedio_mensual + examen_bimestral) / 2
        promedio_final = promedio_final.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        
        # Crear o actualizar consolidado bimestral
        consolidado, created = ConsolidadoBimestral.objects.update_or_create(
            estudiante_id=estudiante_id,
            curso_id=curso_id,
            bimestre_id=bimestre_id,
            defaults={
                'promedio_final': promedio_final,
                'cerrado': True
            }
        )
        
        # Calcular posición
        posicion = ConsolidacionService._calcular_posicion(curso_id, bimestre_id, promedio_final)
        consolidado.posicion = posicion
        consolidado.save()
        
        return ConsolidadoBimestralDTO(
            id=consolidado.id,
            estudiante_id=estudiante_id,
            estudiante_nombre=str(estudiante),
            curso_id=curso_id,
            curso_nombre=curso.nombre,
            bimestre_id=bimestre_id,
            bimestre_nombre=bimestre.nombre,
            promedio_mensual_1=promedio_mensual,
            promedio_mensual_2=None,
            examen_bimestral=examen_bimestral,
            promedio_final=promedio_final,
            posicion=posicion,
            cerrado=True,
            precondiciones_cumplidas=True,
            errores=[]
        )
    
    @staticmethod
    def consolidar_ugel(estudiante_id: int, curso_id: int) -> ConsolidadoUGELDTO:
        """
        Consolida las notas para el reporte UGEL según las reglas específicas.
        """
        # Obtener todos los bimestres consolidados para este estudiante y curso
        consolidados_bimestrales = ConsolidadoBimestral.objects.filter(
            estudiante_id=estudiante_id,
            curso_id=curso_id,
            cerrado=True
        ).select_related('bimestre').order_by('bimestre__fecha_inicio')
        
        bimestres_disponibles = consolidados_bimestrales.count()
        
        # Obtener notas por bimestre
        bimestre_1 = None
        bimestre_2 = None
        bimestre_3 = None
        bimestre_4 = None
        
        for i, consolidado in enumerate(consolidados_bimestrales):
            if i == 0:
                bimestre_1 = consolidado.promedio_final
            elif i == 1:
                bimestre_2 = consolidado.promedio_final
            elif i == 2:
                bimestre_3 = consolidado.promedio_final
            elif i == 3:
                bimestre_4 = consolidado.promedio_final
        
        # Calcular promedio final según reglas UGEL
        promedios = [b for b in [bimestre_1, bimestre_2, bimestre_3, bimestre_4] if b is not None]
        
        if not promedios:
            promedio_final = Decimal('0.00')
        else:
            promedio_final = sum(promedios) / len(promedios)
            promedio_final = promedio_final.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        
        # Calcular equivalencia literal
        letra = ConsolidacionService.calcular_equivalencia_letra(promedio_final)
        
        # Generar comentario automático
        comentario = ConsolidacionService._generar_comentario(promedio_final, letra, bimestres_disponibles)
        
        # Calcular posición en el curso
        posicion_curso = ConsolidacionService._calcular_posicion_anual(curso_id, promedio_final)
        
        try:
            estudiante = User.objects.get(id=estudiante_id)
            curso = Curso.objects.get(id=curso_id)
        except (User.DoesNotExist, Curso.DoesNotExist):
            return ConsolidadoUGELDTO(
                id=0,
                estudiante_id=estudiante_id,
                estudiante_codigo="N/A",
                estudiante_nombre="No encontrado",
                curso_id=curso_id,
                curso_nombre="No encontrado",
                bimestre_1=bimestre_1,
                bimestre_2=bimestre_2,
                bimestre_3=bimestre_3,
                bimestre_4=bimestre_4,
                promedio_final=promedio_final,
                letra=letra,
                posicion_curso=None,
                comentario="Error en datos",
                bimestres_disponibles=bimestres_disponibles
            )
        
        # Crear o actualizar consolidado UGEL
        consolidado_ugel, created = ConsolidadoUGEL.objects.update_or_create(
            estudiante_id=estudiante_id,
            curso_id=curso_id,
            defaults={
                'bimestre_1': bimestre_1,
                'bimestre_2': bimestre_2,
                'bimestre_3': bimestre_3,
                'bimestre_4': bimestre_4,
                'promedio_final': promedio_final,
                'letra': letra,
                'posicion_curso': posicion_curso,
                'comentario': comentario
            }
        )
        
        return ConsolidadoUGELDTO(
            id=consolidado_ugel.id,
            estudiante_id=estudiante_id,
            estudiante_codigo=getattr(estudiante, 'codigo', str(estudiante.id)),
            estudiante_nombre=str(estudiante),
            curso_id=curso_id,
            curso_nombre=curso.nombre,
            bimestre_1=bimestre_1,
            bimestre_2=bimestre_2,
            bimestre_3=bimestre_3,
            bimestre_4=bimestre_4,
            promedio_final=promedio_final,
            letra=letra,
            posicion_curso=posicion_curso,
            comentario=comentario,
            bimestres_disponibles=bimestres_disponibles
        )
    
    @staticmethod
    def _calcular_posicion(curso_id: int, bimestre_id: int, promedio_actual: Decimal) -> int:
        """
        Calcula la posición del estudiante en el curso para un bimestre específico.
        Maneja empates correctamente.
        """
        mejores = ConsolidadoBimestral.objects.filter(
            curso_id=curso_id,
            bimestre_id=bimestre_id,
            promedio_final__gt=promedio_actual,
            cerrado=True
        ).count()
        
        return mejores + 1
    
    @staticmethod
    def _calcular_posicion_anual(curso_id: int, promedio_actual: Decimal) -> int:
        """
        Calcula la posición del estudiante en el curso para el promedio anual.
        """
        mejores = ConsolidadoUGEL.objects.filter(
            curso_id=curso_id,
            promedio_final__gt=promedio_actual
        ).count()
        
        return mejores + 1
    
    @staticmethod
    def _generar_comentario(promedio: Decimal, letra: str, bimestres_disponibles: int) -> str:
        """Genera comentario automático basado en el desempeño."""
        if letra == 'AD':
            return f"Excelente desempeño académico. Promedio {promedio} en {bimestres_disponibles} bimestre(s)."
        elif letra == 'A':
            return f"Buen desempeño académico. Promedio {promedio} en {bimestres_disponibles} bimestre(s)."
        elif letra == 'B':
            return f"Desempeño regular. Necesita mejorar. Promedio {promedio} en {bimestres_disponibles} bimestre(s)."
        else:
            return f"Desempeño insuficiente. Requiere apoyo. Promedio {promedio} en {bimestres_disponibles} bimestre(s)."