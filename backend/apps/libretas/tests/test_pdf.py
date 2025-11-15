from django.test import TestCase
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()

class PdfSmokeTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="tester", password="pass")
        self.client.login(username="tester", password="pass")

    def test_pdf_mock_ok(self):
        # Modo mock: no bloquea prechecks
        settings.USE_FAKE_DATA = True

        # GET (no POST) y con params mínimos
        url = "/api/libretas/bimestral/pdf"
        resp = self.client.get(url, {"grado": "1", "bimestre": 2, "nivel": "primaria"})

        self.assertEqual(resp.status_code, 200)
        # Puede ser PDF (si WeasyPrint está instalado) o HTML (fallback)
        self.assertIn(resp["Content-Type"], ["application/pdf", "text/html"])
        # Nombre de archivo correcto
        self.assertIn("boleta_", resp["Content-Disposition"])

    def test_pdf_bimestre_invalido(self):
        settings.USE_FAKE_DATA = True

        url = "/api/libretas/bimestral/pdf"
        # bimestre fuera de rango => 400
        resp = self.client.get(url, {"grado": "1", "bimestre": 9})
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.json().get("code"), "BIMESTRE_INVALIDO")
