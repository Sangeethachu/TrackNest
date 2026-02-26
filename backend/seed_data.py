import os
import django
from datetime import datetime, timedelta
import random

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "expense_tracker.settings")
django.setup()

from django.contrib.auth.models import User
from expenses.models import Category, PaymentMethod, Transaction, SavingsGoal, MonthlyBudget, UserProfile
from django.utils import timezone

def seed():
    # Create Demo User
    user, created = User.objects.get_or_create(username='demo@example.com', email='demo@example.com')
    if created:
        user.set_password('Password123!')
        user.first_name = 'Demo'
        user.last_name = 'User'
        user.save()
        print("Created demo user.")
    
    # User Profile
    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.avatar_url = 'https://i.pravatar.cc/150?u=demo'
    profile.save()

    # Create Categories
    categories_data = [
        {'name': 'Food', 'icon': 'utensils', 'is_income': False},
        {'name': 'Rent', 'icon': 'home', 'is_income': False},
        {'name': 'Travel', 'icon': 'car', 'is_income': False},
        {'name': 'Shopping', 'icon': 'shopping-bag', 'is_income': False},
        {'name': 'Salary', 'icon': 'briefcase', 'is_income': True},
        {'name': 'Freelance', 'icon': 'laptop', 'is_income': True},
    ]
    categories = {}
    for data in categories_data:
        cat, _ = Category.objects.get_or_create(name=data['name'], defaults={'icon': data['icon'], 'is_income': data['is_income']})
        categories[data['name']] = cat

    # Create Payment Methods
    pm_data = [
        {'name': 'Credit Card', 'icon': 'credit-card', 'color': '#3b82f6'},
        {'name': 'Cash', 'icon': 'banknote', 'color': '#10b981'},
        {'name': 'Bank Transfer', 'icon': 'building-2', 'color': '#8b5cf6'},
    ]
    pms = {}
    for data in pm_data:
        pm, _ = PaymentMethod.objects.get_or_create(name=data['name'], defaults={'icon': data['icon'], 'color': data['color']})
        pms[data['name']] = pm
    
    # Determine base date
    base_date = timezone.now()

    # Create transactions if few exist
    if Transaction.objects.filter(user=user).count() < 10:
        print("Adding demo transactions...")
        # Add income
        Transaction.objects.create(
            user=user, title='Monthly Salary', amount=85000.00, transaction_type='income',
            category=categories['Salary'], payment_method=pms['Bank Transfer'], date=base_date - timedelta(days=25)
        )
        Transaction.objects.create(
            user=user, title='Freelance Project', amount=15000.00, transaction_type='income',
            category=categories['Freelance'], payment_method=pms['Bank Transfer'], date=base_date - timedelta(days=15)
        )

        expenses = [
            ('Rent Payment', 25000.00, 'Rent', 'Bank Transfer', 24),
            ('Groceries', 3500.50, 'Food', 'Credit Card', 20),
            ('Uber to office', 450.00, 'Travel', 'Cash', 18),
            ('Dinner at Italian Restaurant', 2800.00, 'Food', 'Credit Card', 14),
            ('Amazon Order', 4200.00, 'Shopping', 'Credit Card', 10),
            ('Flight Booking', 12500.00, 'Travel', 'Credit Card', 8),
            ('Coffee', 350.00, 'Food', 'Cash', 5),
            ('Weekly Groceries', 2100.00, 'Food', 'Credit Card', 2),
            ('Movie Tickets', 850.00, 'Shopping', 'Cash', 1),
        ]
        
        for title, amount, cat, pm, days_ago in expenses:
            Transaction.objects.create(
                user=user, title=title, amount=amount, transaction_type='expense',
                category=categories[cat], payment_method=pms[pm], date=base_date - timedelta(days=days_ago)
            )

    # Monthly Budget
    budget, _ = MonthlyBudget.objects.get_or_create(user=user)
    budget.amount = 60000.00
    budget.save()

    # Savings Goal
    goal, _ = SavingsGoal.objects.get_or_create(user=user, name='Europe Trip')
    goal.target_amount = 150000.00
    goal.saved_amount = 45000.00
    goal.icon = 'plane'
    goal.color = '#eab308' # yellow-500
    goal.save()

    print("Demo data seeded successfully.")

if __name__ == '__main__':
    seed()
