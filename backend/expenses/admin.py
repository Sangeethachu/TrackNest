from django.contrib import admin
from .models import PaymentMethod, Category, Transaction

@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ('name', 'color')

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_income')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('title', 'amount', 'category', 'payment_method', 'date')
    list_filter = ('category', 'payment_method', 'date')
    search_fields = ('title', 'description')
