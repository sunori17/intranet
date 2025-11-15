from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NotaMensualAPIView, ExamenBimestralAPIView, 
    CierreMensualAPIView, PromedioBimestralAPIView,
    CursoViewSet, SeccionViewSet
)

# Router para ViewSets
router = DefaultRouter()
router.register(r'cursos', CursoViewSet)
router.register(r'secciones', SeccionViewSet)

urlpatterns = [
    # API endpoints principales
    path('notas-mensuales/', NotaMensualAPIView.as_view(), name='notas-mensuales'),
    path('examenes-bimestrales/', ExamenBimestralAPIView.as_view(), name='examenes-bimestrales'),
    path('cierre-mensual/', CierreMensualAPIView.as_view(), name='cierre-mensual'),
    path('promedio-bimestral/', PromedioBimestralAPIView.as_view(), name='promedio-bimestral'),
    
    # Referencias (ViewSets)
    path('', include(router.urls)),
]