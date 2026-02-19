from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'expenses'

router = DefaultRouter()
router.register(r'transactions', views.TransactionViewSet)
router.register(r'categories', views.CategoryViewSet)
router.register(r'payment-methods', views.PaymentMethodViewSet)
router.register(r'savings-goals', views.SavingsGoalViewSet)
router.register(r'monthly-budget', views.MonthlyBudgetView, basename='monthly-budget')


urlpatterns = [
    path('', views.home, name='home'),
    path('add/', views.add_transaction, name='add_transaction'),
    path('stats/', views.stats_view, name='stats'),
    path('api/webhook/sms/', views.sms_webhook, name='sms_webhook'),
    path('api/reset-data/', views.reset_data, name='reset_data'),
    path('api/user/', views.current_user, name='current_user'),
    path('api/update-profile/', views.update_profile, name='update_profile'),
    path('api/', include(router.urls)),
]
