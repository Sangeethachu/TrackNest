from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'expenses'

router = DefaultRouter()
router.register(r'transactions', views.TransactionViewSet, basename='transaction')
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'payment-methods', views.PaymentMethodViewSet)
router.register(r'savings-goals', views.SavingsGoalViewSet, basename='savings-goal')
router.register(r'monthly-budget', views.MonthlyBudgetView, basename='monthly-budget')
router.register(r'notifications', views.NotificationViewSet, basename='notification')


from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('', views.home, name='home'),
    path('api/register/', views.register_user, name='register'),
    path('api/forgot-password/', views.forgot_password, name='forgot_password'),
    path('api/change-pin/', views.change_pin, name='change_pin'),
    path('api/upload-statement/', views.upload_statement, name='upload_statement'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/webhook/sms/', views.sms_webhook, name='sms_webhook'),
    path('api/reset-data/', views.reset_data, name='reset_data'),
    path('api/health-check/', views.health_check, name='health_check'),
    path('api/user/', views.current_user, name='current_user'),
    path('api/update-profile/', views.update_profile, name='update_profile'),
    path('api/', include(router.urls)),
]
