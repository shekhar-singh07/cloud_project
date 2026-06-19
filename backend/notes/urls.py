from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NoteViewSet, signup, login

router = DefaultRouter()
router.register(r'notes', NoteViewSet, basename='note')

urlpatterns = [
    path('signup/', signup, name='signup'),
    path('login/', login, name='login'),
] + router.urls
