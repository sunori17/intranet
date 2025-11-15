# backend/apps/libretas/tests/test_calc.py
from django.test import SimpleTestCase
from apps.libretas.services.calc_service import nota_a_letra, _round2

class CalcTests(SimpleTestCase):
    def test_num_a_letra_basico(self):
        self.assertEqual(nota_a_letra(18), "AD")
        self.assertEqual(nota_a_letra(16.5), "A")
        self.assertEqual(nota_a_letra(12.9), "B")
        self.assertEqual(nota_a_letra(10), "C")

    def test_redondeo(self):
        self.assertEqual(float(_round2(12.345)), 12.35)

