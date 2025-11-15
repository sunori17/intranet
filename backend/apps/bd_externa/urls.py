from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MySQLConnectionViewSet, SyncLogViewSet, MySQLSyncViewSet

router = DefaultRouter()
router.register(r'connections', MySQLConnectionViewSet)
router.register(r'sync-logs', SyncLogViewSet)
router.register(r'sync', MySQLSyncViewSet, basename='sync')

urlpatterns = [
    path('', include(router.urls)),
]