from pathlib import Path
import os
from dotenv import load_dotenv

# === Paths / Base ===
BASE_DIR = Path(__file__).resolve().parent.parent

# === Env ===
load_dotenv(BASE_DIR / ".env")  # lee variables desde backend/.env (si existe)
DEBUG = os.getenv("DEBUG", "True") == "True"
SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
ALLOWED_HOSTS = [h.strip() for h in os.getenv("ALLOWED_HOSTS", "127.0.0.1,localhost,testserver").split(",") if h.strip()]

# ←—— TOGGLE MOCK vs BD REAL ————————————————
USE_FAKE_DATA = os.getenv("USE_FAKE_DATA", "True") == "True"
# cambia a False cuando la BD real esté lista
# ——————————————————————————————————————————————

# === Base de Datos ===
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# === Apps ===
INSTALLED_APPS = [
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Terceros
    "rest_framework",
    "corsheaders",  # ← necesario para permitir acceso desde el frontend

    # Apps del proyecto
    "apps.accesos",
    "apps.notas",
    "apps.consolidacion",
    "apps.libretas",
    "apps.bd_externa",
]

# === Middleware ===
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # ← debe ir antes de CommonMiddleware
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# === CORS ===
CORS_ALLOW_ALL_ORIGINS = True  # ← permite acceso desde cualquier origen (útil en desarrollo)
# En producción puedes usar:
# CORS_ALLOWED_ORIGINS = ["http://localhost:5173"]

# === URLs / WSGI / ASGI ===
ROOT_URLCONF = "intranet.urls"
WSGI_APPLICATION = "intranet.wsgi.application"
ASGI_APPLICATION = "intranet.asgi.application"

# === Templates ===
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "libretas" / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# === Static / Media ===
STATIC_URL = "static/"
STATICFILES_DIRS = []
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# === Zona horaria / Idioma ===
LANGUAGE_CODE = "es"
TIME_ZONE = "America/Lima"
USE_I18N = True
USE_TZ = True

# === Django REST Framework ===
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.BasicAuthentication",
    ],
}

# === Default PK type ===
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
