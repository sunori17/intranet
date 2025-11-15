from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    # APIs reorganizadas según SEGUNDO ENTREGABLE
    path("api/accesos/", include("apps.accesos.urls")),           # Autenticación y permisos
    path("api/notas/", include("apps.notas.urls")),               # Registro de notas mensuales
    path("api/consolidacion/", include("apps.consolidacion.urls")), # Consolidación bimestral
    path("api/libretas/", include("apps.libretas.urls")),         # PDFs y archivos UGEL
    path("api/bd-externa/", include("apps.bd_externa.urls")),     # Sincronización MySQL
]
