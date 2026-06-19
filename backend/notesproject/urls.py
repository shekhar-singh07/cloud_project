from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('notes.urls')),
    path('', TemplateView.as_view(template_name='index.html')),
]

urlpatterns += static(
    'assets/',
    document_root=settings.BASE_DIR / 'dist' / 'assets'
)