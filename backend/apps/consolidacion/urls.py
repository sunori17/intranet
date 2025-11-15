from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConsolidadoBimestralViewSet, ConsolidadoUGELViewSet

# Router para consolidación
router = DefaultRouter()
router.register(r'consolidados-bimestrales', ConsolidadoBimestralViewSet)
router.register(r'consolidados-ugel', ConsolidadoUGELViewSet)

urlpatterns = [
    path('', include(router.urls)),
]