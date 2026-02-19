from django.core.management.base import BaseCommand
from expenses.models import Category, PaymentMethod

class Command(BaseCommand):
    help = 'Seeds initial categories and payment methods for the expense tracker'

    def handle(self, *args, **kwargs):
        # 1. Seed Categories
        categories = [
            # Expenses
            {'name': 'Food', 'icon': 'Utensils', 'is_income': False, 'budget_limit': 5000},
            {'name': 'Shopping', 'icon': 'ShoppingBag', 'is_income': False, 'budget_limit': 2000},
            {'name': 'Travel', 'icon': 'Car', 'is_income': False, 'budget_limit': 1500},
            {'name': 'Entertainment', 'icon': 'Music', 'is_income': False, 'budget_limit': 1000},
            {'name': 'Bills', 'icon': 'Zap', 'is_income': False, 'budget_limit': 3000},
            {'name': 'Health', 'icon': 'Heart', 'is_income': False, 'budget_limit': 1000},
            {'name': 'Education', 'icon': 'Library', 'is_income': False, 'budget_limit': 1000},
            {'name': 'General', 'icon': 'CreditCard', 'is_income': False, 'budget_limit': 1000},
            # Income
            {'name': 'Salary', 'icon': 'DollarSign', 'is_income': True, 'budget_limit': 0},
            {'name': 'Freelance', 'icon': 'Briefcase', 'is_income': True, 'budget_limit': 0},
            {'name': 'Investment', 'icon': 'TrendingUp', 'is_income': True, 'budget_limit': 0},
        ]

        for cat_data in categories:
            cat, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'icon': cat_data['icon'],
                    'is_income': cat_data['is_income'],
                    'budget_limit': cat_data['budget_limit']
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created category: {cat.name}"))
            else:
                self.stdout.write(f"Category already exists: {cat.name}")

        # 2. Seed Payment Methods
        payment_methods = [
            {'name': 'UPI', 'icon': 'Smartphone', 'color': '#6B7280'},
            {'name': 'Cash', 'icon': 'Wallet', 'color': '#6B7280'},
            {'name': 'Bank Transfer', 'icon': 'Building2', 'color': '#6B7280'},
            {'name': 'Credit Card', 'icon': 'CreditCard', 'color': '#6B7280'},
        ]

        for pm_data in payment_methods:
            pm, created = PaymentMethod.objects.get_or_create(
                name=pm_data['name'],
                defaults={
                    'icon': pm_data['icon'],
                    'color': pm_data['color']
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created payment method: {pm.name}"))
            else:
                self.stdout.write(f"Payment method already exists: {pm.name}")

        self.stdout.write(self.style.SUCCESS("Database seeding complete!"))
