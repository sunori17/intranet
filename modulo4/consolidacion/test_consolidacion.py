from django.test import SimpleTestCase
from decimal import Decimal
from apps.libretas.services.consolidacion_service import ConsolidacionService

class ConsolidacionServiceTest(SimpleTestCase):

    def test_calcular_equivalencia_letra(self):
        self.assertEqual(ConsolidacionService.calcular_equivalencia_letra(Decimal('19.5')), 'AD')
        self.assertEqual(ConsolidacionService.calcular_equivalencia_letra(Decimal('15.0')), 'A')
        self.assertEqual(ConsolidacionService.calcular_equivalencia_letra(Decimal('12.0')), 'B')
        self.assertEqual(ConsolidacionService.calcular_equivalencia_letra(Decimal('8.0')), 'C')

    def test_calcular_promedio_ugel(self):
        # Test con un solo bimestre
        bimestres = [Decimal('15.5')]
        promedio = ConsolidacionService._calcular_promedio_ugel(bimestres)
        self.assertEqual(promedio, Decimal('15.50'))

        # Test con múltiples bimestres
        bimestres = [Decimal('15.5'), Decimal('16.0'), Decimal('14.5')]
        promedio = ConsolidacionService._calcular_promedio_ugel(bimestres)
        self.assertEqual(promedio, Decimal('15.33'))

        # Test con bimestres None (simulando faltantes)
        bimestres = [Decimal('15.5'), None, Decimal('14.5')]
        promedio = ConsolidacionService._calcular_promedio_ugel(bimestres)
        self.assertEqual(promedio, Decimal('15.00'))