from rest_framework import serializers
from .models import Transaction, Category, PaymentMethod, SavingsGoal, UserProfile, Notification
from django.contrib.auth.models import User

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ['id', 'name', 'icon', 'color']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'icon', 'is_income', 'budget_limit']

class TransactionSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True, required=False, allow_null=True
    )
    payment_method = PaymentMethodSerializer(read_only=True)
    payment_method_id = serializers.PrimaryKeyRelatedField(
        queryset=PaymentMethod.objects.all(), source='payment_method', write_only=True, required=False, allow_null=True
    )
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'title', 'amount', 'transaction_type', 
            'category', 'category_id', 
            'payment_method', 'payment_method_id',
            'date', 'description'
        ]

class SavingsGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsGoal
        fields = ['id', 'name', 'target_amount', 'saved_amount', 'icon', 'color', 'created_at']


class MonthlyBudgetSerializer(serializers.ModelSerializer):
    class Meta:
        from .models import MonthlyBudget
        model = MonthlyBudget
        fields = ['amount', 'updated_at']

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['avatar_url']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'notification_type', 'is_read', 'created_at']

