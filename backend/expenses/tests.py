from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from .models import Notification, MonthlyBudget, Category, PaymentMethod, Transaction, SavingsGoal

class NotificationTests(APITestCase):

    def setUp(self):
        # Create a test user
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'password123',
            'first_name': 'Test'
        }
        self.user = User.objects.create_user(**self.user_data)
        self.client.force_authenticate(user=self.user)
        
        # Setup basic data needed for transactions
        self.category = Category.objects.create(name='Food', is_income=False)
        self.payment_method = PaymentMethod.objects.create(name='Cash')

    def test_welcome_notification(self):
        """
        Test that registering a new user triggers a 'Welcome' notification.
        """
        # Register a NEW user via API (since notification logic is in the view)
        url = reverse('expenses:register')
        new_user_data = {
            'username': 'newbie',
            'email': 'newbie@example.com',
            'password': 'password123', 
            'first_name': 'Newbie'
        }
        response = self.client.post(url, new_user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check if notification exists for this new user
        new_user = User.objects.get(username='newbie')
        notification = Notification.objects.filter(user=new_user, title='Welcome to TrackNest!').first()
        self.assertIsNotNone(notification, "User should receive a welcome notification")
        self.assertEqual(notification.notification_type, 'success')

    def test_budget_notifications(self):
        """
        Test that budget alerts trigger at 80% and 100% usage.
        """
        # Set Monthly Budget to 1000
        MonthlyBudget.objects.create(user=self.user, amount=1000)
        
        url = reverse('expenses:transaction-list')

        # 1. Add expense of 800 (80%) -> Expect Warning
        data_80 = {
            'title': 'Big Purchase',
            'amount': 800,
            'transaction_type': 'expense',
            'category_id': self.category.id,
            'payment_method_id': self.payment_method.id,
            # 'date' defaults to now() which is what budget logic uses
        }
        
        response = self.client.post(url, data_80, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check for 80% Warning Notification
        notif_warning = Notification.objects.filter(user=self.user, title='Budget Alert')
        self.assertEqual(notif_warning.count(), 1, "Should create exactly one budget alert")
        self.assertEqual(notif_warning.first().notification_type, 'warning')

        # 1b. Add another small expense (e.g. 10) to stay in 80-100% range but trigger check again
        data_small = {
            'title': 'Small Purchase',
            'amount': 10,
            'transaction_type': 'expense',
            'category_id': self.category.id,
            'payment_method_id': self.payment_method.id
        }
        self.client.post(url, data_small, format='json')
        
        # Verify NO new notification created (Anti-Spam)
        self.assertEqual(Notification.objects.filter(user=self.user, title='Budget Alert').count(), 1, "Should not create duplicate alert today")

        # 2. Add another expense of 250 (Total 1050 > 100%) -> Expect Error
        data_over = {
            'title': 'Overflow Purchase',
            'amount': 250, 
            'transaction_type': 'expense',
            'category_id': self.category.id,
            'payment_method_id': self.payment_method.id
        }
        response = self.client.post(url, data_over, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check for 100% Error Notification
        notif_error = Notification.objects.filter(user=self.user, title='Budget Exceeded!').first()
        self.assertIsNotNone(notif_error, "Should create a budget exceeded alert at 100%")
        self.assertEqual(notif_error.notification_type, 'error')


    def test_goal_achievement_notification(self):
        """
        Test that reaching a savings goal triggers a success notification.
        """
        # Create a Savings Goal
        goal = SavingsGoal.objects.create(
            user=self.user,
            name="New Bike",
            target_amount=1000,
            saved_amount=500
        )
        
        # Add 500 to reach goal (Total 1000)
        # Assuming action detail URL pattern: expenses:savings-goal-add-amount
        # Default router creates detail route with name {basename}-{methodname} usually
        # But @action(detail=True) creates url like .../{pk}/{action_name}/
        # And name is {basename}-{action_name}
        url = reverse('expenses:savings-goal-add-amount', args=[goal.id])
        data = {'amount': 500}
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check Notification
        notif_success = Notification.objects.filter(user=self.user, title='Goal Reached! 🎉').first()
        self.assertIsNotNone(notif_success, "Should satisfy the Goal Reached condition")
        self.assertIn("New Bike", notif_success.message)
        self.assertEqual(notif_success.notification_type, 'success')
