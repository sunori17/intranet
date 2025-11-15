# apps/libretas/urls.py
from django.urls import path
from .views.pdf import bimestral_pdf 
from .views.ugel import (
    ugel_consolidado_get,
    ugel_export_post,
    ugel_upload_post,
    ugel_download_get,
    ugel_excel_get,
)

urlpatterns = [
    path("bimestral/pdf", bimestral_pdf, name="libretas_bimestral_pdf"),
    path("ugel/consolidado", ugel_consolidado_get),
    path("ugel/export", ugel_export_post),
    path("ugel/upload", ugel_upload_post, name="ugel-upload"),
    path("ugel/download", ugel_download_get, name="ugel-download"),
    path("ugel/excel", ugel_excel_get, name="libretas-ugel-excel"),
]
