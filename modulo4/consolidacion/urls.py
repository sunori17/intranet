from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.consolidacion_views import ConsolidadoBimestralViewSet, ConsolidadoUGELViewSet

# Router para consolidación
consolidacion_router = DefaultRouter()
consolidacion_router.register(r'consolidados-bimestrales', ConsolidadoBimestralViewSet)
consolidacion_router.register(r'consolidados-ugel', ConsolidadoUGELViewSet)

urlpatterns = [
    # ... tus otras URLs existentes ...
    path('api/consolidacion/', include(consolidacion_router.urls)),
]